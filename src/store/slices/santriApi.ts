import { smpApi } from '../baseApi';

// Definisi tipe Santri dan respons API
export interface Santri {
  id: number;
  nama: string;
  nis: string;
  // Tambahkan properti lain dari objek Santri jika diperlukan
}

export interface GetSantriResponse {
  message: string;
  data: Santri[];
}

export const santriApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getSantri: builder.query<GetSantriResponse, void>({ // Ganti 'any[]' dengan tipe data Santri yang sebenarnya
      query: () => 'main/student', // Asumsi endpoint untuk santri adalah '/api/santri'
      providesTags: ['Santri'],
    }),
  }),
});

export const { useGetSantriQuery } = santriApi;