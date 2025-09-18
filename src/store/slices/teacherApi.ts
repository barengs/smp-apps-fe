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
      query: (formData) => ({
        url: 'main/staff',
        method: 'POST',
        body: formData,
        // FormData akan otomatis diatur dengan content-type yang benar
      }),
      invalidatesTags: ['Teacher'],
    }),
    updateTeacher: builder.mutation<SingleTeacherApiResponse, { id: string; data: FormData }>({
      query: ({ id, data }) => {
        data.append('_method', 'PUT');
        return {
          url: `main/staff/${id}`,
          method: 'POST',
          body: data,
          // FormData akan otomatis diatur dengan content-type yang benar
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