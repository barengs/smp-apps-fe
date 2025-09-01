import { smpApi } from '../baseApi';
import { TeacherAssignmentApiResponse } from '@/types/teacherAssignment';

export const teacherAssignmentApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeacherAssignments: builder.query<TeacherAssignmentApiResponse, void>({
      query: () => '/master/staff-study',
      providesTags: ['TeacherAssignment'],
    }),
  }),
});

export const {
  useGetTeacherAssignmentsQuery,
} = teacherAssignmentApi;