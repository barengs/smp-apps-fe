import { smpApi } from '../baseApi';

// --- API Response and Request Types ---

// Struktur untuk satu objek pekerjaan dari API
interface PekerjaanApiData {
  id: number;
  name: string;
}

// Respons GET adalah array langsung
type GetPekerjaanResponse = PekerjaanApiData[];

// Struktur untuk body request POST/PUT
export interface CreateUpdatePekerjaanRequest {
  name: string;
}

export const pekerjaanApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getPekerjaan: builder.query<GetPekerjaanResponse, void>({
      query: () => 'master/occupation', // Diperbarui
      providesTags: ['Pekerjaan'],
    }),
    createPekerjaan: builder.mutation<PekerjaanApiData, CreateUpdatePekerjaanRequest>({
      query: (newPekerjaan) => ({
        url: 'master/occupation', // Diperbarui
        method: 'POST',
        body: newPekerjaan,
      }),
      invalidatesTags: ['Pekerjaan'],
    }),
    updatePekerjaan: builder.mutation<PekerjaanApiData, { id: number; data: CreateUpdatePekerjaanRequest }>({
      query: ({ id, data }) => ({
        url: `master/occupation/${id}`, // Diperbarui
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Pekerjaan'],
    }),
    deletePekerjaan: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/occupation/${id}`, // Diperbarui
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