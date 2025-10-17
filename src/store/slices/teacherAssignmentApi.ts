import { smpApi } from '../baseApi';
import { TeacherAssignmentApiResponse, StaffDetailFromApi } from '@/types/teacherAssignment';
import { PaginatedResponse, PaginationParams } from '@/types/master-data'; // Import PaginatedResponse and PaginationParams

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
      transformResponse: (response: TeacherAssignmentApiResponse) => {
        // Assuming TeacherAssignmentApiResponse.data is already PaginatedResponse<StaffDetailFromApi>
        // If it's not, you might need an intermediate type or adjust TeacherAssignmentApiResponse
        return response.data as PaginatedResponse<StaffDetailFromApi>;
      },
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