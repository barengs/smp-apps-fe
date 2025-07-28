import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './index';

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
  prepareHeaders: (headers, { getState }) => {
    // Ambil token dari state auth
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    // Tambahkan header Accept dan Content-Type
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const smpApi = createApi({
  reducerPath: 'smpApi',
  baseQuery: baseQuery,
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
    'Study', // Tambahkan tag type 'Study' di sini
    'User', // Tambahkan tag type 'User'
    'Profile', // Tambahkan tag type 'Profile' di sini
  ],
  endpoints: () => ({}),
});