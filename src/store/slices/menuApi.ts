import { smpApi } from '../baseApi';

// --- API Response and Request Types ---

export interface MenuItem {
  id: number;
  id_title: string;
  en_title: string | null;
  ar_title: string | null;
  description: string | null;
  icon: string;
  route: string | null;
  type: string;
  position: string;
  status: string;
  order: string | number | null;
  child: MenuItem[]; // Nested children
  parent_id: number | string | null;
  created_at: string;
  updated_at: string;
}

interface GetMenuResponse {
  message: string;
  data: MenuItem[];
}

export interface CreateUpdateMenuRequest {
  id_title: string;
  en_title?: string | null;
  ar_title?: string | null;
  description?: string | null;
  icon?: string;
  route: string;
  type: string;
  position: string;
  status: string;
  order?: number | null;
  parent_id?: number | null;
}

// NEW: request body for assigning permissions to a menu
export interface AssignMenuPermissionsRequest {
  permissions: number[];
}

export const menuApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getMenu: builder.query<GetMenuResponse, void>({
      query: () => 'master/menu',
      providesTags: ['Menu'],
    }),
    createMenu: builder.mutation<MenuItem, CreateUpdateMenuRequest>({
      query: (newMenu) => ({
        url: 'master/menu',
        method: 'POST',
        body: newMenu,
      }),
      invalidatesTags: ['Menu'],
    }),
    updateMenu: builder.mutation<MenuItem, { id: number; data: CreateUpdateMenuRequest }>({
      query: ({ id, data }) => ({
        url: `master/menu/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Menu'],
    }),
    // NEW: duplicate of updateMenu without invalidating tags, for batch updates
    updateMenuPosition: builder.mutation<MenuItem, { id: number; data: CreateUpdateMenuRequest }>({
      query: ({ id, data }) => ({
        url: `master/menu/${id}`,
        method: 'PUT',
        body: data,
      }),
    }),
    deleteMenu: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `master/menu/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Menu'],
    }),
    // NEW: assign permissions to a specific menu
    assignMenuPermissions: builder.mutation<{ message: string }, { menuId: number; data: AssignMenuPermissionsRequest }>({
      query: ({ menuId, data }) => ({
        url: `master/menu/${menuId}/assign-permissions`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Menu'],
    }),
  }),
});

export const { useGetMenuQuery, useCreateMenuMutation, useUpdateMenuMutation, useUpdateMenuPositionMutation, useDeleteMenuMutation } = menuApi;
// NEW: export hook for assigning permissions to a menu
export const { useAssignMenuPermissionsMutation } = menuApi;