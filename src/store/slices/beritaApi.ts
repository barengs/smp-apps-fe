import { smpApi } from '../baseApi';
import type { Berita } from '@/types/informasi';

interface GetBeritaResponse {
  message: string;
  data: Berita[];
}

interface UpdateBeritaPayload {
  id: number;
  data: FormData;
}

export const beritaApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getBerita: builder.query<GetBeritaResponse, void>({
      query: () => 'main/news',
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Berita' as const, id })),
              { type: 'Berita', id: 'LIST' },
            ]
          : [{ type: 'Berita', id: 'LIST' }],
    }),
    getBeritaById: builder.query<{ data: Berita }, number>({
      query: (id) => `main/news/${id}`,
      providesTags: (result, error, id) => [{ type: 'Berita', id }],
    }),
    createBerita: builder.mutation<Berita, FormData>({
      query: (newBerita) => ({
        url: 'main/news',
        method: 'POST',
        body: newBerita,
      }),
      invalidatesTags: [{ type: 'Berita', id: 'LIST' }],
    }),
    updateBerita: builder.mutation<Berita, UpdateBeritaPayload>({
      query: ({ id, data }) => ({
        url: `main/news/${id}`,
        method: 'POST', // Menggunakan POST untuk mengirim multipart/form-data
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Berita', id }, { type: 'Berita', id: 'LIST' }],
    }),
    deleteBerita: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `main/news/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Berita', id }, { type: 'Berita', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetBeritaQuery,
  useGetBeritaByIdQuery,
  useCreateBeritaMutation,
  useUpdateBeritaMutation,
  useDeleteBeritaMutation,
} = beritaApi;