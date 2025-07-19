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

export const smpApi = createApi({
  reducerPath: 'smpApi', // Nama unik untuk reducer ini
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ['Role'], // Add 'Role' tag type for caching
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
  }),
});

// Ekspor hook yang dihasilkan untuk setiap endpoint
export const { useGetSantriQuery, useGetRolesQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation } = smpApi;