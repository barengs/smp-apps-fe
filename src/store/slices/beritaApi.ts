import { smpApi } from '../baseApi';
import type { Berita } from '@/types/informasi';

interface GetBeritaResponse {
  message: string;
  data: Berita[];
}

interface BeritaPayload {
  title: string;
  content: string;
  status: 'published' | 'draft';
}

interface UpdateBeritaPayload {
  id: number;
  data: Partial<BeritaPayload>;
}

export const beritaApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getBerita: builder.query<GetBeritaResponse, void>({
      query: () => 'news',
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Berita' as const, id })),
              { type: 'Berita', id: 'LIST' },
            ]
          : [{ type: 'Berita', id: 'LIST' }],
    }),
    createBerita: builder.mutation<Berita, BeritaPayload>({
      query: (newBerita) => ({
        url: 'news',
        method: 'POST',
        body: newBerita,
      }),
      invalidatesTags: [{ type: 'Berita', id: 'LIST' }],
    }),
    updateBerita: builder.mutation<Berita, UpdateBeritaPayload>({
      query: ({ id, data }) => ({
        url: `news/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Berita', id }],
    }),
    deleteBerita: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `news/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Berita', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetBeritaQuery,
  useCreateBeritaMutation,
  useUpdateBeritaMutation,
  useDeleteBeritaMutation,
} = beritaApi;