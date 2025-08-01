import { smpApi } from '../baseApi';

export const calonSantriApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getCalonSantri: builder.query<any[], void>({ 
      query: () => 'registration', // Mengubah endpoint dari 'calon-santri' menjadi 'registration'
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