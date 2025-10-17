import { smpApi } from '../baseApi';
import { TeacherAssignmentApiResponse, StaffDetailFromApi } from '@/types/teacherAssignment';
import { PaginatedResponse, PaginationParams } from '@/types/master-data';

const asPaginatedStaff = (data: any): PaginatedResponse<StaffDetailFromApi> => {
  if (data && typeof data === 'object' && 'data' in data) return data as PaginatedResponse<StaffDetailFromApi>;
  const arr = Array.isArray(data) ? data : [];
  return {
    current_page: 1,
    data: arr,
    first_page_url: '',
    from: arr.length ? 1 : 0,
    last_page: 1,
    last_page_url: '',
    links: [],
    next_page_url: null,
    path: '',
    per_page: arr.length || 10,
    prev_page_url: null,
    to: arr.length,
    total: arr.length,
  };
};

export interface AssignStudiesRequest {
  staffId: string;
  studyIds: string[];
}

export const teacherAssignmentApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeacherAssignments: builder.query<PaginatedResponse<StaffDetailFromApi>, PaginationParams>({ // Update return type and add params
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params.sort_order) queryParams.append('sort_order', params.sort_order);
        return `/master/staff-study?${queryParams.toString()}`;
      },
      transformResponse: (response: TeacherAssignmentApiResponse) => asPaginatedStaff(response.data),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'TeacherAssignment' as const, id })),
              { type: 'TeacherAssignment', id: 'LIST' },
            ]
          : [{ type: 'TeacherAssignment', id: 'LIST' }],
    }),
    assignStudiesToStaff: builder.mutation<StaffDetailFromApi, AssignStudiesRequest>({
      query: ({ staffId, studyIds }) => ({
        url: `master/staff-study/${staffId}`,
        method: 'PUT',
        body: { study_ids: studyIds.map(id => Number(id)) },
      }),
      invalidatesTags: [{ type: 'TeacherAssignment', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetTeacherAssignmentsQuery,
  useAssignStudiesToStaffMutation,
} = teacherAssignmentApi;