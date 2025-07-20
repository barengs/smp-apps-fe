import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://api.smp.barengsaya.com/api';

export const smpApi = createApi({
  reducerPath: 'smpApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ['Role', 'Santri', 'Employee', 'Permission', 'Student', 'Parent', 'Dashboard'], // Menambahkan tagTypes yang relevan
  endpoints: () => ({}), // Endpoint akan diinjeksikan dari file lain
});