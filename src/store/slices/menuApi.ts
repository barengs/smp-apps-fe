import { smpApi } from '../baseApi';

// --- API Response and Request Types ---

interface MenuItem {
  id: number;
  title: string;
  description: string | null;
  icon: string;
  route: string;
  type: string;
  position: string;
  status: string;
  order: number | null;
  child: MenuItem[]; // Nested children
  parent_id: number | null;
}

interface GetMenuResponse {
  message: string;
  data: MenuItem[];
}

export interface CreateUpdateMenuRequest {
  title: string;
  description?: string | null;
  icon?: string;
  route: string;
  type: string;
  position: string;
  status: string;
  order?: number | null;
  parent_id?: number | null;
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
    deleteMenu: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `master/menu/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Menu'],
    }),
  }),
});

export const { useGetMenuQuery, useCreateMenuMutation, useUpdateMenuMutation, useDeleteMenuMutation } = menuApi;