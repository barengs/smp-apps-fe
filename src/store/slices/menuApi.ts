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
  // child items are usually managed separately or added after creation for simplicity
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