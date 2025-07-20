import { smpApi } from '../baseApi';

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
interface GetPermissionsResponse {
  message: string;
  data: PermissionApiData[];
}

// Structure for the POST/PUT request body
export interface CreateUpdatePermissionRequest {
  name: string;
  description?: string;
}

export const permissionApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getPermissions: builder.query<GetPermissionsResponse, void>({
      query: () => 'master/permission',
      providesTags: ['Permission'],
    }),
    createPermission: builder.mutation<PermissionApiData, CreateUpdatePermissionRequest>({
      query: (newPermission) => ({
        url: 'master/permission',
        method: 'POST',
        body: newPermission,
      }),
      invalidatesTags: ['Permission'],
    }),
    updatePermission: builder.mutation<PermissionApiData, { id: number; data: CreateUpdatePermissionRequest }>({
      query: ({ id, data }) => ({
        url: `master/permission/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Permission'],
    }),
    deletePermission: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/permission/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Permission'],
    }),
  }),
});

export const {
  useGetPermissionsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} = permissionApi;