import { smpApi } from '../baseApi';
import { CalonSantri, PaginatedResponse, CalonSantriApiResponse } from '@/types/calonSantri'; // Import new types

export const calonSantriApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getCalonSantri: builder.query<CalonSantriApiResponse, void>({ // Change return type to CalonSantriApiResponse
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