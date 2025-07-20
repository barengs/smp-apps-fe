import { smpApi } from '../baseApi';

// Define the full API response structure
// The stats are at the root level, not inside a 'data' object.
interface GetDashboardResponse {
  message: string;
  santri: number;
  asatidz: number;
  alumni: number;
  tugasan: number;
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