import { smpApi } from '../baseApi';
import { TeacherApiResponse, SingleTeacherApiResponse, StaffApiResponse, Staff } from '@/types/teacher';

interface AllStaffApiResponse {
  message: string;
  data: Staff[];
}

export const teacherApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeachers: builder.query<TeacherApiResponse, void>({
      query: () => 'main/staff/teachers/roles',
      providesTags: ['Teacher'],
    }),
    getStaffs: builder.query<Staff[], void>({
      query: () => 'main/staff',
      transformResponse: (response: AllStaffApiResponse) => response.data,
      providesTags: ['Staff'],
    }),
    getTeacherById: builder.query<StaffApiResponse, string>({
      query: (id) => `main/staff/${id}`,
      providesTags: (result, error, id) => [{ type: 'Teacher', id }],
    }),
    addTeacher: builder.mutation<SingleTeacherApiResponse, FormData>({
      query: (formData) => ({
        url: 'main/staff',
        method: 'POST',
        body: formData,
        // JANGAN set headers secara manual untuk FormData
        // Laravel akan otomatis mengenali multipart/form-data
      }),
      invalidatesTags: ['Teacher', 'Staff'],
    }),
    updateTeacher: builder.mutation<SingleTeacherApiResponse, { id: string; data: FormData }>({
      query: ({ id, data }) => {
        data.append('_method', 'PUT');
        return {
          url: `main/staff/${id}`,
          method: 'POST',
          body: data,
          // JANGAN set headers secara manual untuk FormData
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Teacher', id }, 'Teacher', 'Staff'],
    }),
    deleteTeacher: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `main/staff/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Teacher', 'Staff'],
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useGetStaffsQuery,
  useGetTeacherByIdQuery,
  useAddTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
} = teacherApi;