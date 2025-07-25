import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://api.smp.barengsaya.com/api';

// Define the API response structure for a single role
interface RoleApiResponse {
  id: number;
  name: string; // Corresponds to roleName in frontend
  guard_name: string;
  created_at: string;
  updated_at: string;
}

// Define the API response structure for multiple roles
interface GetRolesResponse {
  message: string;
  data: RoleApiResponse[];
}

// Define the request body for creating/updating a role
// Based on the API response, it seems only 'name' is relevant for CRUD
interface CreateUpdateRoleRequest {
  name: string;
  // If description or accessRights need to be sent, the API needs to support them
}

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

export const smpApi = createApi({
  reducerPath: 'smpApi', // Nama unik untuk reducer ini
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ['Role', 'Activity'], // Add 'Activity' tag type for caching
  endpoints: (builder) => ({
    // Contoh endpoint: mengambil semua data santri
    getSantri: builder.query<any[], void>({ // Ganti 'any[]' dengan tipe data Santri yang sebenarnya
      query: () => 'santri', // Asumsi endpoint untuk santri adalah '/api/santri'
    }),
    // New endpoints for Role management
    getRoles: builder.query<GetRolesResponse, void>({
      query: () => 'master/role',
      providesTags: ['Role'], // Tag this query with 'Role'
    }),
    createRole: builder.mutation<RoleApiResponse, CreateUpdateRoleRequest>({
      query: (newRole) => ({
        url: 'master/role',
        method: 'POST',
        body: newRole,
      }),
      invalidatesTags: ['Role'], // Invalidate 'Role' tag after creation
    }),
    updateRole: builder.mutation<RoleApiResponse, { id: number; data: CreateUpdateRoleRequest }>({
      query: ({ id, data }) => ({
        url: `master/role/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Role'], // Invalidate 'Role' tag after update
    }),
    deleteRole: builder.mutation<void, number>({ // Assuming delete returns nothing specific
      query: (id) => ({
        url: `master/role/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Role'], // Invalidate 'Role' tag after deletion
    }),
    // New endpoints for Activity management
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

// Ekspor hook yang dihasilkan untuk setiap endpoint
export const {
  useGetSantriQuery,
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetActivitiesQuery,
  useCreateActivityMutation,
  useUpdateActivityMutation,
  useDeleteActivityMutation,
} = smpApi;