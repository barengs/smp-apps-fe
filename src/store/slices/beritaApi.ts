import { smpApi } from '../baseApi';

interface Berita {
  id: number;
  title: string;
  content: string;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
}

interface GetBeritaResponse {
  message: string;
  data: Berita[];
}

export const beritaApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getBerita: builder.query<GetBeritaResponse, void>({
      query: () => 'news', // Mengubah endpoint dari 'berita' menjadi 'news'
      providesTags: ['Berita'],
    }),
    // Endpoint untuk create, update, delete akan ditambahkan di sini nanti
  }),
});

export const { useGetBeritaQuery } = beritaApi;