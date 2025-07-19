import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://api.smp.barengsaya.com/api';

export const smpApi = createApi({
  reducerPath: 'smpApi', // Nama unik untuk reducer ini
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({
    // Contoh endpoint: mengambil semua data santri
    // Anda dapat menambahkan endpoint lain di sini (misalnya, login, register, dll.)
    getSantri: builder.query<any[], void>({ // Ganti 'any[]' dengan tipe data Santri yang sebenarnya
      query: () => 'santri', // Asumsi endpoint untuk santri adalah '/api/santri'
    }),
    // Contoh endpoint untuk login (mutation)
    // login: builder.mutation<LoginResponse, LoginCredentials>({
    //   query: (credentials) => ({
    //     url: 'login',
    //     method: 'POST',
    //     body: credentials,
    //   }),
    // }),
  }),
});

// Ekspor hook yang dihasilkan untuk setiap endpoint
export const { useGetSantriQuery } = smpApi;