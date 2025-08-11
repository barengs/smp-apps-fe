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

export const dashboardApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<GetDashboardResponse, void>({
      query: () => 'dashboard',
      providesTags: ['Dashboard'], // Tag this query for caching
    }),
    getStudentStatisticsByPeriod: builder.query<GetStudentStatisticsByPeriodResponse, void>({
      query: () => 'dashboard/student-statistics-by-period',
      providesTags: ['StudentStatistics'], // Tag this query for caching
    }),
  }),
});

export const { useGetDashboardStatsQuery, useGetStudentStatisticsByPeriodQuery } = dashboardApi;