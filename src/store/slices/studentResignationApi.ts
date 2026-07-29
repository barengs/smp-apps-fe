import { smpApi } from '../baseApi';
import { PaginationParams } from '@/types/master-data';

export interface StudentResignation {
  id: number;
  student_id: number;
  submission_type: 'biasa' | 'pasca_tugas';
  status: 'pending' | 'proses' | 'disetujui' | 'ditolak';
  attachment_path: string | null;
  note: string | null;
  processed_by: number | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  student: {
    id: number;
    first_name: string;
    last_name: string;
    nis: string;
    status: string;
    program?: { id: number; name: string };
    hostel?: { id: number; name: string };
    parents?: Array<{
      id: number;
      first_name: string;
      last_name: string;
      nik: string;
      kk: string;
      phone: string;
    }>;
    violations?: Array<{
      id: number;
      violation_date: string;
      violation: {
        id: number;
        name: string;
        category?: { id: number; name: string };
      };
      sanctions?: Array<{
        id: number;
        sanction: { id: number; name: string; point_value?: number };
      }>;
    }>;
  };
  processor?: {
    id: number;
    name: string;
  };
}

export interface ResignationListResponse {
  message: string;
  status: number;
  data: {
    data: StudentResignation[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface SingleResignationResponse {
  message: string;
  status: number;
  data: StudentResignation;
}

export interface ResignationQueryParams extends PaginationParams {
  search?: string;
  status?: string;
  submission_type?: string;
}

export const studentResignationApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentResignations: builder.query<ResignationListResponse, ResignationQueryParams>({
      query: (params) => ({
        url: 'main/student-resignations',
        method: 'GET',
        params,
      }),
      providesTags: ['Student'], // Re-validate when student status changes
    }),
    getStudentResignationById: builder.query<SingleResignationResponse, number>({
      query: (id) => `main/student-resignations/${id}`,
    }),
    createStudentResignation: builder.mutation<SingleResignationResponse, FormData>({
      query: (formData) => ({
        url: 'main/student-resignations',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Student'],
    }),
    updateStudentResignation: builder.mutation<SingleResignationResponse, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `main/student-resignations/${id}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Student'],
    }),
    deleteStudentResignation: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `main/student-resignations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Student'],
    }),
  }),
});

export const {
  useGetStudentResignationsQuery,
  useGetStudentResignationByIdQuery,
  useCreateStudentResignationMutation,
  useUpdateStudentResignationMutation,
  useDeleteStudentResignationMutation,
} = studentResignationApi;
