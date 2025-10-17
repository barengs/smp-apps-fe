import { smpApi } from '../baseApi';
import { PaginatedResponse, PaginationParams } from '@/types/master-data'; // Import PaginatedResponse and PaginationParams

// --- API Response and Request Types ---

// Structure for a single permission object from the API
interface PermissionApiData {
  id: number;
  name: string;
  description: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

// Structure for the GET /permission response
interface GetPermissionsRawResponse {
  message: string;
  data: PaginatedResponse<PermissionApiData>; // Wrap in PaginatedResponse
}

// Structure for the POST/PUT request body
export interface CreateUpdatePermissionRequest {
  name: string;
  description?: string;
}

export const permissionApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getPermissions: builder.query<PaginatedResponse<PermissionApiData>, PaginationParams>({ // Update return type and add params
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params.sort_order) queryParams.append('sort_order', params.sort_order);
        return `main/permission?${queryParams.toString()}`;
      },
      transformResponse: (response: GetPermissionsRawResponse) => response.data, // Extract the PaginatedResponse
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Permission' as const, id })),
              { type: 'Permission', id: 'LIST' },
            ]
          : [{ type: 'Permission', id: 'LIST' }],
    }),
    createPermission: builder.mutation<PermissionApiData, CreateUpdatePermissionRequest>({
      query: (newPermission) => ({
        url: 'main/permission',
        method: 'POST',
        body: newPermission,
      }),
      invalidatesTags: [{ type: 'Permission', id: 'LIST' }],
    }),
    updatePermission: builder.mutation<PermissionApiData, { id: number; data: CreateUpdatePermissionRequest }>({
      query: ({ id, data }) => ({
        url: `main/permission/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Permission', id }, { type: 'Permission', id: 'LIST' }],
    }),
    deletePermission: builder.mutation<void, number>({
      query: (id) => ({
        url: `main/permission/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Permission', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPermissionsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} = permissionApi;