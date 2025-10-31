import { smpApi } from '../baseApi';
import { PaginationParams } from '@/types/master-data';

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
interface GetRolesRawResponse {
  status?: string | number;
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
    getRoles: builder.query<RoleApiResponse[], PaginationParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params.sort_order) queryParams.append('sort_order', params.sort_order);
        return `main/role?${queryParams.toString()}`;
      },
      transformResponse: (response: GetRolesRawResponse): RoleApiResponse[] => response.data,
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'Role' as const, id })),
              { type: 'Role', id: 'LIST' },
            ]
          : [{ type: 'Role', id: 'LIST' }],
    }),
    getRoleById: builder.query<RoleApiResponse, number>({
      query: (id) => `main/role/${id}`,
      transformResponse: (response: RoleApiResponse | { data: RoleApiResponse }) =>
        (typeof response === 'object' && response !== null && 'data' in response ? (response as { data: RoleApiResponse }).data : (response as RoleApiResponse)),
      providesTags: (result) =>
        result ? [{ type: 'Role', id: result.id }] : [{ type: 'Role', id: 'DETAIL' }],
    }),
    createRole: builder.mutation<RoleApiResponse, CreateUpdateRoleRequest>({
      query: (newRole) => ({
        url: 'main/role',
        method: 'POST',
        body: newRole,
      }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),
    updateRole: builder.mutation<RoleApiResponse, { id: number; data: CreateUpdateRoleRequest }>({
      query: ({ id, data }) => ({
        url: `main/role/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Role', id }, { type: 'Role', id: 'LIST' }],
    }),
    deleteRole: builder.mutation<void, number>({
      query: (id) => ({
        url: `main/role/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),
  }),
});

export const { useGetRolesQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation } = roleApi;
export const { useGetRoleByIdQuery } = roleApi;