import { smpApi } from '../baseApi';

export const santriApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getSantri: builder.query<any[], void>({ // Ganti 'any[]' dengan tipe data Santri yang sebenarnya
      query: () => 'santri', // Asumsi endpoint untuk santri adalah '/api/santri'
      providesTags: ['Santri'],
    }),
  }),
});

export const { useGetSantriQuery } = santriApi;