import { smpApi } from '../baseApi';

// Define the API response structure for a single activity
interface ActivityApiResponse {
  id: number;
  title: string;
  description?: string;
  activity_date: string; // Assuming YYYY-MM-DD format from API
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Define the API response structure for multiple activities
interface GetActivitiesResponse {
  message: string;
  data: ActivityApiResponse[];
}

// Define the request body for creating an activity
interface CreateActivityRequest {
  title: string;
  description?: string;
  activity_date: string; // YYYY-MM-DD format
}

// Define the request body for updating an activity
interface UpdateActivityRequest {
  title?: string; // Optional for partial updates
  description?: string;
  activity_date?: string;
  is_completed?: boolean;
}

export const activityApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getActivities: builder.query<GetActivitiesResponse, void>({
      query: () => 'activity',
      providesTags: ['Activity'],
    }),
    createActivity: builder.mutation<ActivityApiResponse, CreateActivityRequest>({
      query: (newActivity) => ({
        url: 'activity',
        method: 'POST',
        body: newActivity,
      }),
      invalidatesTags: ['Activity'],
    }),
    updateActivity: builder.mutation<ActivityApiResponse, { id: number; data: UpdateActivityRequest }>({
      query: ({ id, data }) => ({
        url: `activity/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Activity'],
    }),
    deleteActivity: builder.mutation<void, number>({
      query: (id) => ({
        url: `activity/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Activity'],
    }),
  }),
});

export const {
  useGetActivitiesQuery,
  useCreateActivityMutation,
  useUpdateActivityMutation,
  useDeleteActivityMutation,
} = activityApi;