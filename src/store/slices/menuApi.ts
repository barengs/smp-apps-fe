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
    // Add mutations for update, delete if needed later
  }),
});

export const { useGetMenuQuery, useCreateMenuMutation } = menuApi;