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
  }),
});

export const {
  useCreateStudentViolationReportMutation,
  useGetStudentViolationReportQuery,
} = studentViolationApi;