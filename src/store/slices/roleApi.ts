import { smpApi } from '../baseApi';

// Define the nested permission structure
interface PermissionNestedData {
  name: string;
}

// Define menu structure within role
interface MenuNestedData {
  id: number;
  title: string;
}

// Define the API response structure for a single role
interface RoleApiResponse {
  id: number;
  name: string; // Corresponds to roleName in frontend
  guard_name: string;
  created_at: string;
  updated_at: string;
  permissions: PermissionNestedData[];
  menus: MenuNestedData[];
}

// Define the API response structure for multiple roles
interface GetRolesResponse {
  message: string;
  data: RoleApiResponse[];
}

// Define the request body for creating/updating a role
interface CreateUpdateRoleRequest {
  name: string;
  permission?: string[];
  menu_id?: number[];
}

export const roleApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<GetRolesResponse, void>({
      query: () => 'master/role',
      providesTags: ['Role'],
    }),
    createRole: builder.mutation<RoleApiResponse, CreateUpdateRoleRequest>({
      query: (newRole) => ({
        url: 'master/role',
        method: 'POST',
        body: newRole,
      }),
      invalidatesTags: ['Role'],
    }),
    updateRole: builder.mutation<RoleApiResponse, { id: number; data: CreateUpdateRoleRequest }>({
      query: ({ id, data }) => ({
        url: `master/role/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Role'],
    }),
    deleteRole: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/role/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Role'],
    }),
  }),
});

export const { useGetRolesQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation } = roleApi;