import { smpApi } from '../baseApi';

// Define the full API response structure
// The stats are now expected inside a 'data' object.
interface GetDashboardResponse {
  message: string;
  data: { // Added 'data' wrapper
    santri: number;
    asatidz: number;
    alumni: number;
    tugasan: number;
    santri_baru: number;
  };
}

// New interface for student statistics by period
interface StudentStatistic {
  period: string; // e.g., "2020/2021"
  total: number;
}

interface GetStudentStatisticsByPeriodResponse {
  message: string;
  data: StudentStatistic[];
}

export interface KamtibHolidayStats {
  title: string;
  start_date: string;
  end_date: string;
  total_santri: number;
  checkout_count: number;
  checkin_count: number;
  not_returned_count: number;
}

export interface KamtibTrend {
  name: string;
  total: number;
}

export interface GetKamtibStatisticsResponse {
  status: string;
  data: {
    active_leaves: number;
    violations_today: number;
    holiday: KamtibHolidayStats | null;
    trends: {
      violations: KamtibTrend[];
      leaves: KamtibTrend[];
    };
  };
}

export interface KurikulumRombelDetail {
  id: number;
  name: string;
  tingkat: string;
  student_count: number;
}

export interface KurikulumAttendanceToday {
  rate: number;
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
  total_recorded: number;
}

export interface GetKurikulumStatisticsResponse {
  status: string;
  data: {
    academic_year: string;
    total_teachers: number;
    total_subjects: number;
    total_rombel: number;
    total_students: number;
    rombel_details: KurikulumRombelDetail[];
    attendance_today: KurikulumAttendanceToday;
  };
}

export interface PendidikanInstitutionDetail {
  id: number;
  name: string;
  classroom_count: number;
  rombel_count: number;
}

export interface GetPendidikanStatisticsResponse {
  status: string;
  data: {
    total_programs: number;
    total_institutions: number;
    total_classrooms: number;
    total_class_groups: number;
    institution_distribution: PendidikanInstitutionDetail[];
  };
}

export interface KamtibHolidayStudent {
  id: number;
  nis: string;
  full_name: string;
  room_name: string;
  checkout_at: string | null;
  checkin_at: string | null;
}

export interface GetKamtibHolidayStudentsResponse {
  status: string;
  data: KamtibHolidayStudent[];
}

export const dashboardApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<GetDashboardResponse, void>({
      query: () => 'main/dashboard',
      providesTags: ['Dashboard'], // Tag this query for caching
    }),
    getStudentStatisticsByPeriod: builder.query<GetStudentStatisticsByPeriodResponse, void>({
      query: () => 'main/dashboard/student-statistics-by-period',
      providesTags: ['StudentStatistics'], // Tag this query for caching
    }),
    getKamtibStatistics: builder.query<GetKamtibStatisticsResponse, void>({
      query: () => 'main/dashboard/kamtib-statistics',
      providesTags: ['Dashboard'], // Can use a separate tag later if needed
    }),
    getKurikulumStatistics: builder.query<GetKurikulumStatisticsResponse, void>({
      query: () => 'main/dashboard/kurikulum-statistics',
      providesTags: ['Dashboard'],
    }),
    getPendidikanStatistics: builder.query<GetPendidikanStatisticsResponse, void>({
      query: () => 'main/dashboard/pendidikan-statistics',
      providesTags: ['Dashboard'],
    }),
    getKamtibHolidayStudents: builder.query<GetKamtibHolidayStudentsResponse, string>({
      query: (status) => `main/dashboard/kamtib-holiday-students?status=${status}`,
    }),
  }),
});

export const { 
  useGetDashboardStatsQuery, 
  useGetStudentStatisticsByPeriodQuery, 
  useGetKamtibStatisticsQuery,
  useGetKurikulumStatisticsQuery,
  useGetPendidikanStatisticsQuery,
  useGetKamtibHolidayStudentsQuery
} = dashboardApi;