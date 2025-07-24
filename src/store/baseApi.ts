import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const smpApi = createApi({
  reducerPath: 'smpApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_BASE_URL }),
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
    'EducationClass', // Tambahkan tag baru di sini
  ],
  endpoints: () => ({}),
});