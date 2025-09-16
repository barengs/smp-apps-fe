import { smpApi } from '../baseApi';
import { TeacherApiResponse, SingleTeacherApiResponse } from '@/types/teacher';

export const teacherApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeachers: builder.query<TeacherApiResponse, void>({
      query: () => 'main/staff/teachers/roles', // Endpoint diubah di sini
      providesTags: ['Teacher'],
    }),
    getTeacherById: builder.query<SingleTeacherApiResponse, string>({
      query: (id) => `main/staff/teachers/roles/${id}`, // Endpoint diperbarui di sini
      providesTags: (result, error, id) => [{ type: 'Teacher', id }],
    }),
    addTeacher: builder.mutation<SingleTeacherApiResponse, FormData>({
      query: (newTeacher) => ({
        url: 'teachers',
        method: 'POST',
        body: newTeacher,
        formData: true,
      }),
      invalidatesTags: ['Teacher'],
    }),
    updateTeacher: builder.mutation<SingleTeacherApiResponse, { id: string; data: FormData }>({
      query: ({ id, data }) => {
        data.append('_method', 'PUT');
        return {
          url: `teachers/${id}`,
          method: 'POST', // Menggunakan POST untuk mengirim FormData pada update
          body: data,
          formData: true,
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Teacher', id }, 'Teacher'],
    }),
    deleteTeacher: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `teachers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Teacher'],
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