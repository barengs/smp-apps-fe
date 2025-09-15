import { smpApi } from '../baseApi';
import { Pekerjaan } from '@/types/master-data';

// --- API Response and Request Types ---

// Struktur respons API untuk list
interface GetPekerjaanApiResponse {
  data: {
    data: Pekerjaan[];
  };
}

// Struktur respons API untuk satu item
interface SinglePekerjaanApiResponse {
  data: Pekerjaan;
}

// Struktur untuk body request POST/PUT
export interface CreateUpdatePekerjaanRequest {
  name: string;
  code: string;
  description: string;
}

export const pekerjaanApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getPekerjaan: builder.query<Pekerjaan[], void>({
      query: () => 'master/occupation',
      transformResponse: (response: GetPekerjaanApiResponse) => response.data.data,
      providesTags: ['Pekerjaan'],
    }),
    createPekerjaan: builder.mutation<Pekerjaan, CreateUpdatePekerjaanRequest>({
      query: (newPekerjaan) => ({
        url: 'master/occupation',
        method: 'POST',
        body: newPekerjaan,
      }),
      transformResponse: (response: SinglePekerjaanApiResponse) => response.data,
      invalidatesTags: ['Pekerjaan'],
    }),
    updatePekerjaan: builder.mutation<Pekerjaan, { id: number; data: CreateUpdatePekerjaanRequest }>({
      query: ({ id, data }) => ({
        url: `master/occupation/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: SinglePekerjaanApiResponse) => response.data,
      invalidatesTags: ['Pekerjaan'],
    }),
    deletePekerjaan: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/occupation/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Pekerjaan'],
    }),
  }),
});

export const {
  useGetPekerjaanQuery,
  useCreatePekerjaanMutation,
  useUpdatePekerjaanMutation,
  useDeletePekerjaanMutation,
} = pekerjaanApi;