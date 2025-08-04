import { smpApi } from '../baseApi';
import { CalonSantri, PaginatedResponse } from '@/types/calonSantri'; // Import new types

export const calonSantriApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getCalonSantri: builder.query<PaginatedResponse<CalonSantri>, void>({ // Change return type to PaginatedResponse
      query: () => 'registration',
      providesTags: ['CalonSantri'],
    }),
    registerSantri: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: 'registration',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['CalonSantri'],
    }),
  }),
  overrideExisting: true,
});

export const { useGetCalonSantriQuery, useRegisterSantriMutation } = calonSantriApi;