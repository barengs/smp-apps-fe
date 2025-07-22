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

export const menuApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getMenu: builder.query<GetMenuResponse, void>({
      query: () => 'master/menu',
      providesTags: ['Menu'],
    }),
    // Add mutations for create, update, delete if needed later
  }),
});

export const { useGetMenuQuery } = menuApi;