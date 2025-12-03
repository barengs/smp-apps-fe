import { smpApi } from '../baseApi';
import { PaginationParams, PaginatedResponse } from '@/types/master-data';

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
  deleted_at?: string | null;
  status?: string;
  // relasi dari backend
  student?: {
    id: number;
    first_name: string;
    last_name?: string | null;
    nis: string;
  };
  violation?: {
    id: number;
    category_id: number | string;
    name: string;
    description: string;
    point: number | string;
    is_active?: boolean;
    category?: unknown;
  };
  academic_year?: {
    id: number;
    year: string;
    type?: string;
    periode?: string;
    start_date?: string;
    end_date?: string;
    active?: boolean;
    description?: string | null;
    deleted_at?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  reporter?: {
    id: number;
    first_name: string;
    last_name?: string | null;
  };
  sanctions?: unknown[];
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

export interface StudentViolationStatistics {
  total_violations: string | number;
  by_status: {
    pending: string | number;
    verified: string | number;
    processed: string | number;
    cancelled: string | number;
  };
  by_category?: string | Array<{ category?: string; name?: string; total?: string | number }>;
  top_violators?: string | Array<{ id?: string | number; first_name?: string; last_name?: string | null; nis?: string; total_violations?: string | number }>;
}

// NEW: Payload untuk assign sanksi
export interface AssignSanctionRequest {
  sanction_id: number;
  start_date: string;
  end_date: string;
  notes?: string;
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

    // List laporan dengan pagination dari backend
    getStudentViolations: builder.query<PaginatedResponse<StudentViolation>, PaginationParams>({
      query: (params = {}) => {
        const qp = new URLSearchParams();
        if (params.page) qp.append('page', String(params.page));
        if (params.per_page) qp.append('per_page', String(params.per_page));
        if (params.search) qp.append('search', params.search);
        if (params.sort_by) qp.append('sort_by', params.sort_by);
        if (params.sort_order) qp.append('sort_order', params.sort_order);
        return `main/student-violation?${qp.toString()}`;
      },
      transformResponse: (response: any): PaginatedResponse<StudentViolation> => {
        const paginated = response?.data;
        const items: StudentViolation[] = Array.isArray(paginated?.data)
          ? paginated.data.map((item: any): StudentViolation => ({
              id: typeof item.id === 'string' ? Number(item.id) : item.id,
              student_id:
                typeof item.student_id === 'string' ? Number(item.student_id) : item.student_id,
              violation_id:
                typeof item.violation_id === 'string' ? Number(item.violation_id) : item.violation_id,
              academic_year_id:
                typeof item.academic_year_id === 'string' ? Number(item.academic_year_id) : item.academic_year_id,
              violation_date: item.violation_date,
              violation_time: item.violation_time,
              location: item.location ?? null,
              description: item.description ?? null,
              reported_by:
                typeof item.reported_by === 'string' ? Number(item.reported_by) : item.reported_by,
              notes: item.notes ?? null,
              created_at: item.created_at,
              updated_at: item.updated_at,
              deleted_at: item.deleted_at ?? null,
              status: item.status,
              student: item.student
                ? {
                    id: typeof item.student.id === 'string' ? Number(item.student.id) : item.student.id,
                    first_name: item.student.first_name,
                    last_name: item.student.last_name ?? null,
                    nis: item.student.nis,
                  }
                : undefined,
              violation: item.violation
                ? {
                    id: typeof item.violation.id === 'string' ? Number(item.violation.id) : item.violation.id,
                    category_id:
                      typeof item.violation.category_id === 'string'
                        ? Number(item.violation.category_id)
                        : item.violation.category_id,
                    name: item.violation.name,
                    description: item.violation.description,
                    point:
                      typeof item.violation.point === 'string'
                        ? Number(item.violation.point)
                        : item.violation.point,
                    is_active: item.violation.is_active,
                    category: item.violation.category,
                  }
                : undefined,
              academic_year: item.academic_year
                ? {
                    id:
                      typeof item.academic_year.id === 'string'
                        ? Number(item.academic_year.id)
                        : item.academic_year.id,
                    year: item.academic_year.year,
                    type: item.academic_year.type,
                    periode: item.academic_year.periode,
                    start_date: item.academic_year.start_date,
                    end_date: item.academic_year.end_date,
                    active: item.academic_year.active,
                    description: item.academic_year.description ?? null,
                    deleted_at: item.academic_year.deleted_at ?? null,
                    created_at: item.academic_year.created_at,
                    updated_at: item.academic_year.updated_at,
                  }
                : undefined,
              reporter: item.reporter
                ? {
                    id: typeof item.reporter.id === 'string' ? Number(item.reporter.id) : item.reporter.id,
                    first_name: item.reporter.first_name,
                    last_name: item.reporter.last_name ?? null,
                  }
                : undefined,
              sanctions: Array.isArray(item.sanctions) ? item.sanctions : [],
            }))
          : [];

        return {
          ...paginated,
          data: items,
        } as PaginatedResponse<StudentViolation>;
      },
      providesTags: (result) =>
        result && Array.isArray(result.data)
          ? [
              ...result.data.map(({ id }) => ({ type: 'StudentViolation' as const, id })),
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

    // NEW: Statistik pelanggaran
    getStudentViolationStatistics: builder.query<StudentViolationStatistics, void>({
      query: () => 'main/student-violation/statistics',
      transformResponse: (response: { success: boolean; message: string; data: StudentViolationStatistics }) =>
        response.data,
      providesTags: [{ type: 'StudentViolation', id: 'STATISTICS' }],
    }),

    // NEW: Assign sanksi ke laporan pelanggaran
    assignSanctionToViolation: builder.mutation<{ message?: string }, { id: number; data: AssignSanctionRequest }>({
      query: ({ id, data }) => ({
        url: `main/student-violation/${id}/assign-sanction`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, _error, { id }) => [
        { type: 'StudentViolation', id },
        { type: 'StudentViolation', id: 'LIST' },
      ],
    }),

    // NEW: Ubah status laporan pelanggaran
    updateStudentViolationStatus: builder.mutation<{ message?: string }, { id: number; status: 'verified' | 'cancelled' }>({
      query: ({ id, status }) => ({
        url: `main/student-violation/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, _error, { id }) => [
        { type: 'StudentViolation', id },
        { type: 'StudentViolation', id: 'LIST' },
      ],
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
  useGetStudentViolationStatisticsQuery,
  // NEW: Export hook assign sanksi
  useAssignSanctionToViolationMutation,
  // NEW: Export hook update status
  useUpdateStudentViolationStatusMutation,
} = studentViolationApi;