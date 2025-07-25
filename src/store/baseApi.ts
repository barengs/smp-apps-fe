import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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

export const smpApi = createApi({
  reducerPath: 'smpApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
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
    'Pekerjaan', // Tambahkan tag type baru
  ],
  endpoints: () => ({}),
});