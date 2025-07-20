import { smpApi } from '../baseApi';

// Define the structure of the dashboard statistics data
interface DashboardStats {
  santri: number;
  asatidz: number;
  alumni: number;
  tugasan: number;
}

// Define the full API response structure
interface GetDashboardResponse {
  message: string;
  data: DashboardStats;
}

export const dashboardApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<GetDashboardResponse, void>({
      query: () => 'dashboard',
      providesTags: ['Dashboard'], // Tag this query for caching
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;