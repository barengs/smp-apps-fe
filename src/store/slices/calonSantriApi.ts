import { smpApi } from '../baseApi';
import { CalonSantri } from '@/types/calonSantri';

export const calonSantriApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getCalonSantri: builder.query<CalonSantri[], void>({
      query: () => 'calon-santri', // Asumsi endpoint untuk calon santri adalah '/api/calon-santri'
      providesTags: ['CalonSantri'],
      transformResponse: (response: any) => response.data, // Asumsi data berada di dalam properti 'data'
    }),
  }),
});

export const { useGetCalonSantriQuery } = calonSantriApi;