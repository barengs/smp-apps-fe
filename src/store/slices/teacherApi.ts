import { smpApi } from '../baseApi';
import { TeacherApiResponse, SingleTeacherApiResponse, Teacher } from '@/types/teacher';

export const teacherApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeachers: builder.query<TeacherApiResponse, void>({
      query: () => 'staff/teachers-advisors', // Endpoint diperbarui
      providesTags: ['Teacher'],
    }),
    getTeacherById: builder.query<SingleTeacherApiResponse, string>({
      query: (id) => `teachers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Teacher', id }],
    }),
    addTeacher: builder.mutation<SingleTeacherApiResponse, Partial<Teacher>>({
      query: (newTeacher) => ({
        url: 'teachers',
        method: 'POST',
        body: newTeacher,
      }),
      invalidatesTags: ['Teacher'],
    }),
    updateTeacher: builder.mutation<SingleTeacherApiResponse, { id: string; data: Partial<Teacher> }>({
      query: ({ id, data }) => ({
        url: `teachers/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Teacher', id }],
    }),
    deleteTeacher: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `teachers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Teacher', id }],
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useGetTeacherByIdQuery,
  useAddTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
} = teacherApi;