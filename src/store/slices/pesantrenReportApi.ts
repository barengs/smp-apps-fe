import { smpApi } from '../baseApi';

export interface StudentStats {
  summary: {
    active: number;
    new: number;
    graduated: number;
  };
  by_hostel: Array<{
    hostel_name: string;
    count: number;
  }>;
  by_gender: Array<{
    gender: 'L' | 'P';
    count: number;
  }>;
  academic_year: string;
}

export interface ViolationReportItem {
  id: number;
  student_id: number;
  violation_date: string;
  description: string;
  student: {
    first_name: string;
    last_name: string;
    nis: string;
    hostel: { name: string };
  };
  violation: {
    name: string;
    category: {
      name: string;
      severity_level: string;
    };
  };
}

export interface LeaveReportItem {
  id: number;
  student_id: number;
  start_date: string;
  end_date: string;
  status: string;
  student: {
    first_name: string;
    last_name: string;
    nis: string;
  };
  leave_type: {
    name: string;
  };
}

export interface AttendanceStatsItem {
  study_name: string;
  present: number;
  absent: number;
  sick: number;
  permit: number;
  total: number;
  percentage: number;
}

export const pesantrenReportApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentStats: builder.query<StudentStats, void>({
      query: () => 'main/pesantren-report/student-statistics',
      transformResponse: (response: { data: StudentStats }) => response.data,
    }),
    getViolationReport: builder.query<
      { list: ViolationReportItem[]; stats: any[]; period: { start: string; end: string } },
      { start_date?: string; end_date?: string }
    >({
      query: (params) => ({
        url: 'main/pesantren-report/violation-report',
        params,
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),
    getLeaveReport: builder.query<
      { list: LeaveReportItem[]; stats: any[]; period: { start: string; end: string } },
      { start_date?: string; end_date?: string }
    >({
      query: (params) => ({
        url: 'main/pesantren-report/leave-report',
        params,
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),
    getAttendanceStats: builder.query<
      { attendance: AttendanceStatsItem[]; period: { start: string; end: string } },
      { start_date?: string; end_date?: string }
    >({
      query: (params) => ({
        url: 'main/pesantren-report/attendance-statistics',
        params,
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),
  }),
});

export const {
  useGetStudentStatsQuery,
  useGetViolationReportQuery,
  useGetLeaveReportQuery,
  useGetAttendanceStatsQuery,
} = pesantrenReportApi;
