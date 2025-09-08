import { smpApi } from '../baseApi';
import { TeacherAssignmentApiResponse, StaffDetailFromApi } from '@/types/teacherAssignment';

export interface AssignStudiesRequest {
  staffId: string;
  studyIds: string[];
}

export const teacherAssignmentApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeacherAssignments: builder.query<TeacherAssignmentApiResponse, void>({
      query: () => '/master/staff-study',
      providesTags: ['TeacherAssignment'],
    }),
    assignStudiesToStaff: builder.mutation<StaffDetailFromApi, AssignStudiesRequest>({
      query: ({ staffId, studyIds }) => ({
        url: `master/staff-study/${staffId}`,
        method: 'PUT',
        body: { study_ids: studyIds.map(id => Number(id)) },
      }),
      invalidatesTags: ['TeacherAssignment'],
    }),
  }),
});

export const {
  useGetTeacherAssignmentsQuery,
  useAssignStudiesToStaffMutation,
} = teacherAssignmentApi;