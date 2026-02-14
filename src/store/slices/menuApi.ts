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
  children: MenuItem[]; // Nested children (Standardized)
  child?: MenuItem[];   // Raw API response might return this
  parent_id: number | string | null;
  created_at: string;
  updated_at: string;
}

interface GetMenuResponse {
  message: string;
  data: MenuItem[];
}

// Response for user menus (hierarchical)
interface GetUserMenusResponse {
  status: string;
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

// Helper function to normalize menu data (handle child vs children mismatch)
const transformMenuData = (menus: MenuItem[]): MenuItem[] => {
  return menus.map(menu => {
    // If 'child' exists but 'children' is empty/undefined, use 'child'
    const rawChildren = menu.child || menu.children || [];
    
    // Normalize children recursively
    const children = rawChildren.length > 0 ? transformMenuData(rawChildren) : [];
    
    return {
      ...menu,
      children: children,
      // Ensure we don't carry over the raw 'child' property to avoid confusion, 
      // or keep it if needed but 'children' is the source of truth now.
    };
  });
};

export const menuApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getMenu: builder.query<GetMenuResponse, void>({
      query: () => 'master/menu',
      providesTags: ['Menu'],
    }),
    getUserMenus: builder.query<MenuItem[], void>({
      query: () => 'main/user/menus',
      transformResponse: (response: GetUserMenusResponse) => {
        const tree = transformMenuData(response.data);
        // Safeguard: Ensure only root items (no parent_id) are returned at the top level
        return tree.filter(item => !item.parent_id);
      },
      providesTags: ['UserMenus'],
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

export const { useGetMenuQuery, useGetUserMenusQuery, useCreateMenuMutation, useUpdateMenuMutation, useUpdateMenuPositionMutation, useDeleteMenuMutation } = menuApi;
// NEW: export hook for assigning permissions to a menu
export const { useAssignMenuPermissionsMutation } = menuApi;