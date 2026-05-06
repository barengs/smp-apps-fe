import { smpApi } from '../baseApi';
import { TeacherApiResponse, SingleTeacherApiResponse, StaffApiResponse, Staff } from '@/types/teacher';
import { PaginationParams } from '@/types/master-data';

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
    getStaffs: builder.query<Staff[], PaginationParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.page) queryParams.append('page', params.page.toString());
          if (params.per_page) queryParams.append('per_page', params.per_page.toString());
          if (params.search) queryParams.append('search', params.search);
        }
        const queryString = queryParams.toString();
        return `main/staff${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: any) => {
        if (Array.isArray(response?.data)) {
          return response.data;
        }
        if (Array.isArray(response?.data?.data)) {
          return response.data.data;
        }
        return [];
      },
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