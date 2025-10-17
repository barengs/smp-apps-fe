import { smpApi } from '../baseApi';
import { PaginationParams } from '@/types/master-data';

export interface Student {
  id: number;
  first_name: string;
  last_name?: string | null;
  nis: string;
  nik: string;
  period: string;
  gender: string;
  status: string;
  program?: { name: string };
  created_at: string;
  updated_at: string;
  // Opsional untuk halaman detail (sesuai struktur baru)
  photo?: string | null;
  born_in?: string | null;
  born_at?: string | null;
  phone?: string | null;
  address?: string | null;
  parents?: any;
  parent_id?: string;
  kk?: string;
  last_education?: string;
  village_id?: number;
  village?: string;
  district?: string;
  postal_code?: string;
  hostel_id?: number;
  program_id?: number;
  user_id?: number;
  deleted_at?: string;
}

export interface CreateUpdateStudentRequest {
  first_name: string;
  last_name?: string | null;
  nis: string;
  nik: string;
  period: string;
  gender: string;
  status: string;
  program_id?: number;
}

interface GetStudentsResponse {
  data: Student[];
}

export const studentApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudents: builder.query<Student[], PaginationParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params.sort_order) queryParams.append('sort_order', params.sort_order);
        return `main/student?${queryParams.toString()}`;
      },
      // Normalisasi berbagai bentuk respons: { data: Student[] } atau { data: { data: Student[] } }
      transformResponse: (response: any): Student[] => {
        if (Array.isArray(response?.data)) {
          return response.data as Student[];
        }
        if (Array.isArray(response?.data?.data)) {
          return response.data.data as Student[];
        }
        return [];
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'Student' as const, id })),
              { type: 'Student', id: 'LIST' },
            ]
          : [{ type: 'Student', id: 'LIST' }],
    }),
    getStudentById: builder.query<Student, number>({
      query: (id) => `main/student/${id}`,
      transformResponse: (response: { message: string; status: number; data: Student }) => response.data,
      providesTags: (result, error, id) => [{ type: 'Student', id }],
    }),
    createStudent: builder.mutation<Student, CreateUpdateStudentRequest>({
      query: (newStudent) => ({
        url: 'main/student',
        method: 'POST',
        body: newStudent,
      }),
      invalidatesTags: [{ type: 'Student', id: 'LIST' }],
    }),
    updateStudent: builder.mutation<Student, { id: number; data: CreateUpdateStudentRequest }>({
      query: ({ id, data }) => ({
        url: `main/student/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Student', id }, { type: 'Student', id: 'LIST' }],
    }),
    deleteStudent: builder.mutation<void, number>({
      query: (id) => ({
        url: `main/student/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Student', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentByIdQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
} = studentApi;