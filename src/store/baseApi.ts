import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './index';
import { logOut, updateToken } from './authActions'; // Import from new file
import { Mutex } from 'async-mutex';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

// Log untuk debugging
console.log('VITE_API_BASE_URL yang terbaca:', baseUrl);

if (!baseUrl) {
  console.error(
    'ERROR: VITE_API_BASE_URL tidak ditemukan. ' +
    'Pastikan Anda memiliki file .env di root proyek dan sudah mengatur VITE_API_BASE_URL di dalamnya. ' +
    'Setelah itu, restart server Vite.'
  );
}

const baseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState, endpoint }) => {
    // Ambil token dari state auth
    const token = (getState() as RootState).auth.token;
    console.log('Token di prepareHeaders:', token ? 'Ada' : 'Tidak Ada'); // Tambahkan baris ini
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    // Tambahkan header Accept dan Content-Type
    headers.set('Accept', 'application/json');
    
    // Jangan set Content-Type untuk endpoint registrasi karena menggunakan FormData
    if (endpoint !== 'registerSantri') {
      headers.set('Content-Type', 'application/json');
    }
    return headers;
  },
});

// Buat mutex untuk mencegah beberapa permintaan refresh token secara bersamaan
const mutex = new Mutex();

export const baseQueryWithReauth: typeof baseQuery = async (args, api, extraOptions) => {
  // Tunggu hingga mutex tidak terkunci sebelum melanjutkan
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Jika mutex belum terkunci, kunci dan coba refresh token
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        // Menggunakan baseQuery untuk memanggil endpoint refresh
        const refreshResult = await baseQuery(
          { url: 'refresh', method: 'POST' },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const newToken = (refreshResult.data as { access_token: string }).access_token;
          // Perbarui token di state Redux
          api.dispatch(updateToken(newToken));
          // Ulangi permintaan asli yang gagal dengan token baru
          result = await baseQuery(args, api, extraOptions);
        } else {
          // Jika refresh gagal, logout pengguna
          console.log('Refresh token gagal, logout.');
          api.dispatch(logOut());
        }
      } finally {
        // Lepaskan kunci mutex setelah selesai
        release();
      }
    } else {
      // Jika mutex sudah terkunci, tunggu hingga terbuka lalu ulangi permintaan
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const smpApi = createApi({
  reducerPath: 'smpApi',
  baseQuery: baseQueryWithReauth, // Gunakan baseQuery yang sudah dibungkus
  tagTypes: [
    'Role',
    'Santri',
    'Employee',
    'Permission',
    'Student',
    'Parent',
    'Dashboard',
    'Province',
    'City',
    'District',
    'Village',
    'Program',
    'Hostel',
    'EducationLevel',
    'Classroom',
    'ClassGroup',
    'Menu',
    'EducationGroup',
    'Pekerjaan',
    'Activity',
    'Berita',
    'CalonSantri',
    'Study',
    'User',
    'Profile',
    'TahunAjaran',
    'Transaksi', // Tambahkan tag Transaksi
    'ControlPanelSettings', // Tambahkan tag baru ini
  ],
  endpoints: () => ({}),
});