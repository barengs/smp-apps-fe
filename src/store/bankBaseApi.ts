import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './index';
import { logOut, updateToken } from './authActions';
import { Mutex } from 'async-mutex';

const baseUrl = import.meta.env.VITE_BANK_API_BASE_URL;

if (!baseUrl) {
  console.error(
    'ERROR: VITE_BANK_API_BASE_URL tidak ditemukan. ' +
    'Pastikan Anda memiliki file .env di root proyek dan sudah mengatur VITE_BANK_API_BASE_URL di dalamnya. ' +
    'Setelah itu, restart server Vite.'
  );
}

const baseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState, endpoint }) => {
    // Ambil token dari state auth
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    // Daftar endpoint yang menggunakan FormData (Top-Up transfer bank)
    const formDataEndpoints = [
      'uploadBankTransferProof',
      'bankTransferTopUp'
    ];

    if (!formDataEndpoints.includes(endpoint)) {
      headers.set('Accept', 'application/json');
      headers.set('Content-Type', 'application/json');
    } else {
      headers.set('Accept', 'application/json');
    }

    return headers;
  },
});

const mutex = new Mutex();

export const bankBaseQueryWithReauth: typeof baseQuery = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = await baseQuery(
          { url: 'auth/refresh', method: 'POST' },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const newToken = (refreshResult.data as { access_token: string }).access_token;
          api.dispatch(updateToken(newToken));
          result = await baseQuery(args, api, extraOptions);
        } else {
          console.log('Refresh token gagal untuk Bank Santri, logout.');
          api.dispatch(logOut());
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const bankSmpApi = createApi({
  reducerPath: 'bankSmpApi',
  baseQuery: bankBaseQueryWithReauth,
  tagTypes: [
    'Account', 
    'Transaksi', 
    'ProdukBank', 
    'Coa', 
    'TransactionType', 
    'TopUp', 
    'AdminPackage',
    'PaymentPackage',
    'Payment',
    'Setting',
    'KoperasiTransaction'
  ],
  endpoints: () => ({}),
});
