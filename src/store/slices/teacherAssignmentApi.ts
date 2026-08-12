import { smpApi } from '../baseApi';
import { TeacherAssignmentApiResponse, StaffDetailFromApi } from '@/types/teacherAssignment';


export interface AssignStudiesRequest {
  staffId: string;
  studyIds: string[];
}

/**
 * Params untuk getTeacherAssignments.
 * educational_institution_id — jika diisi, backend memfilter guru yang terkait
 * dengan institusi tersebut via dua jalur:
 *   1) staff_educational_institutions pivot
 *   2) PositionAssignment aktif → Position → Organization
 */
export interface TeacherAssignmentParams {
  educational_institution_id?: string;
}

export const teacherAssignmentApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeacherAssignments: builder.query<StaffDetailFromApi[], TeacherAssignmentParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        // Filter institusi — diserahkan ke backend (dual-path query)
        if (params.educational_institution_id) {
          queryParams.append('educational_institution_id', params.educational_institution_id);
        }
        return `/master/staff-study?${queryParams.toString()}`;
      },
      transformResponse: (response: TeacherAssignmentApiResponse) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'TeacherAssignment' as const, id })),
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