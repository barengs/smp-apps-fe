import { smpApi } from '../baseApi';
import { PaginationParams } from '@/types/master-data';

export interface StudentLeavePenaltySanction {
  id: number;
  name: string;
  type: string;
}

export interface StudentLeavePenaltyAssignedBy {
  id: number;
  name: string;
}

export interface StudentLeavePenalty {
  id: number;
  penalty_type: string;
  description: string;
  point_value: number;
  sanction: StudentLeavePenaltySanction;
  assigned_by: StudentLeavePenaltyAssignedBy;
  assigned_at: string;
  created_at: string;
}

export interface StudentLeaveReport {
  id: number;
  student_leave_id: number;
  report_date: string;
  report_time: string;
  report_notes: string;
  condition: string;
  is_late: boolean;
  late_days: number;
  reported_to: { id: number; name: string };
  verified_at: string;
  verified_by: { id: number; name: string };
  penalties: StudentLeavePenalty[];
  created_at: string;
}

export interface StudentLeave {
  id: number;
  student: { id: number; name: string; nis: string };
  leave_type: { id: number; name: string };
  academic_year: { id: number; name: string };
  start_date: string;
  end_date: string;
  duration_days: number;
  reason: string;
  destination: string;
  contact_person: string;
  contact_phone: string;
  status: string;
  approved_by: { id: number; name: string };
  approved_at: string;
  approval_notes: string;
  expected_return_date: string;
  actual_return_date: string;
  has_penalty: boolean;
  is_overdue: boolean;
  days_late: string;
  report?: StudentLeaveReport;
  penalties: StudentLeavePenalty[];
  notes: string;
  created_at: string;
  updated_at: string;
}

interface GetStudentLeavesResponse {
  data: StudentLeave[] | { data: StudentLeave[] };
  links?: any;
  meta?: any;
}

export const studentLeaveApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentLeaves: builder.query<StudentLeave[], PaginationParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', String(params.page));
        if (params?.per_page) queryParams.append('per_page', String(params.per_page));
        if (params?.search) queryParams.append('search', params.search);
        if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
        const qs = queryParams.toString();
        return qs ? `main/student-leave?${qs}` : 'main/student-leave';
      },
      transformResponse: (response: GetStudentLeavesResponse): StudentLeave[] => {
        if (Array.isArray((response as any)?.data)) {
          return (response as any).data as StudentLeave[];
        }
        if (Array.isArray((response as any)?.data?.data)) {
          return (response as any).data.data as StudentLeave[];
        }
        return [];
      },
      // Tidak menggunakan tags agar tidak perlu menambah tagTypes baru di baseApi
    }),
  }),
});

export const { useGetStudentLeavesQuery } = studentLeaveApi;