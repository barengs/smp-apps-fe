import { smpApi } from '../baseApi';

// Define the API response structure for a single activity
interface ActivityApiResponse {
  id: number;
  name: string; // Changed from title
  description?: string;
  date: string; // Changed from activity_date, YYYY-MM-DD format from API
  status: 'active' | 'inactive'; // Changed from is_completed: boolean
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
  name: string; // Changed from title
  description?: string;
  date: string; // Changed from activity_date, YYYY-MM-DD format
  status?: 'active' | 'inactive'; // Changed from is_completed?: boolean
}

// Define the request body for updating an activity
interface UpdateActivityRequest {
  name?: string; // Optional for partial updates, changed from title
  description?: string;
  date?: string; // Changed from activity_date
  status?: 'active' | 'inactive'; // Changed from is_completed?: boolean
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