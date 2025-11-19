import { smpApi } from '../baseApi';

export interface CreateStudentViolationReportRequest {
  student_id: number;
  violation_id: number;
  academic_year_id: number;
  violation_date: string;   // ISO string
  violation_time: string;   // e.g., "HH:mm"
  location?: string;
  description?: string;
  reported_by: number;
  notes?: string;
}

export interface StudentViolation {
  id: number;
  student_id: number;
  violation_id: number;
  academic_year_id: number;
  violation_date: string; // ISO string
  violation_time: string; // e.g., "HH:mm" atau tanggal string
  location?: string | null;
  description?: string | null;
  reported_by: number;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface StudentViolationSummary {
  total_violations: string;
  total_points: string;
  pending: string;
  processed: string;
}

export interface StudentViolationReportData {
  violations: string;
  summary: StudentViolationSummary;
}

export interface StudentViolationReportResponse {
  success: boolean;
  message: string;
  data: StudentViolationReportData;
}

export const studentViolationApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    createStudentViolationReport: builder.mutation<{ message?: string }, CreateStudentViolationReportRequest>({
      query: (payload) => ({
        url: 'main/student-violation',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['StudentViolation'],
    }),
    getStudentViolationReport: builder.query<StudentViolationReportData, number>({
      query: (studentId) => `main/student-violation/student/${studentId}/report`,
      transformResponse: (response: StudentViolationReportResponse) => response.data,
      providesTags: (result, _error, studentId) => [{ type: 'StudentViolation', id: studentId }],
    }),

    // NEW: List semua laporan
    getStudentViolations: builder.query<StudentViolation[], void>({
      query: () => 'main/student-violation',
      transformResponse: (response: any): StudentViolation[] => {
        if (Array.isArray(response?.data)) return response.data as StudentViolation[];
        if (Array.isArray(response?.data?.data)) return response.data.data as StudentViolation[];
        return [];
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'StudentViolation' as const, id })),
              { type: 'StudentViolation', id: 'LIST' },
            ]
          : [{ type: 'StudentViolation', id: 'LIST' }],
    }),

    // NEW: Ambil laporan by id
    getStudentViolationById: builder.query<StudentViolation, number>({
      query: (id) => `main/student-violation/${id}`,
      transformResponse: (response: { data: StudentViolation }) => response.data,
      providesTags: (result, _error, id) => [{ type: 'StudentViolation', id }],
    }),

    // NEW: Update laporan
    updateStudentViolation: builder.mutation<StudentViolation, { id: number; data: CreateStudentViolationReportRequest }>({
      query: ({ id, data }) => ({
        url: `main/student-violation/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, _error, { id }) => [{ type: 'StudentViolation', id }, { type: 'StudentViolation', id: 'LIST' }],
    }),

    // NEW: Hapus laporan
    deleteStudentViolation: builder.mutation<void, number>({
      query: (id) => ({
        url: `main/student-violation/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'StudentViolation', id: 'LIST' }],
    }),
  }),
});

export const {
  useCreateStudentViolationReportMutation,
  useGetStudentViolationReportQuery,
  useGetStudentViolationsQuery,
  useGetStudentViolationByIdQuery,
  useUpdateStudentViolationMutation,
  useDeleteStudentViolationMutation,
} = studentViolationApi;