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
// Helper function to build tree from flat menu list if needed
const buildMenuTree = (menus: MenuItem[]): MenuItem[] => {
  if (!Array.isArray(menus)) return [];

  const map: { [key: number]: MenuItem } = {};
  const roots: MenuItem[] = [];

  // First pass: Create map and normalize children
  menus.forEach(menu => {
    const rawChildren = menu.children || menu.child || [];
    map[menu.id] = { ...menu, children: Array.isArray(rawChildren) ? [...rawChildren] : [] };
  });

  // Second pass: Build hierarchy
  menus.forEach(menu => {
    const node = map[menu.id];
    const parentId = menu.parent_id;

    // Check if parentId is effectively a root (null, undefined, 0, or "0")
    const isRoot = parentId === null || parentId === undefined || parentId === 0 || parentId === "0";

    if (!isRoot) {
      const pId = Number(parentId);
      if (map[pId]) {
        // Avoid duplicate additions
        const alreadyAdded = map[pId].children.some(c => c.id === node.id);
        if (!alreadyAdded) {
          map[pId].children.push(node);
        }
      } else {
        // Parent not found in map, treat as root for safety
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  // Sort roots by order if available
  return roots.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
};

// Helper function to normalize menu data (legacy fallback)
const transformMenuData = (menus: MenuItem[]): MenuItem[] => {
  return buildMenuTree(menus);
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
        // The tree builder already returns only the root nodes
        return transformMenuData(response.data);
      },
      providesTags: ['UserMenus'],
    }),
    createMenu: builder.mutation<MenuItem, CreateUpdateMenuRequest>({
      query: (newMenu) => ({
        url: 'master/menu',
        method: 'POST',
        body: newMenu,
      }),
      invalidatesTags: ['Menu', 'UserMenus'],
    }),
    updateMenu: builder.mutation<MenuItem, { id: number; data: CreateUpdateMenuRequest }>({
      query: ({ id, data }) => ({
        url: `master/menu/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Menu', 'UserMenus'],
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
      invalidatesTags: ['Menu', 'UserMenus'],
    }),
    // NEW: assign permissions to a specific menu
    assignMenuPermissions: builder.mutation<{ message: string }, { menuId: number; data: AssignMenuPermissionsRequest }>({
      query: ({ menuId, data }) => ({
        url: `master/menu/${menuId}/assign-permissions`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Menu', 'UserMenus'],
    }),
  }),
});

export const { useGetMenuQuery, useGetUserMenusQuery, useCreateMenuMutation, useUpdateMenuMutation, useUpdateMenuPositionMutation, useDeleteMenuMutation } = menuApi;
// NEW: export hook for assigning permissions to a menu
export const { useAssignMenuPermissionsMutation } = menuApi;