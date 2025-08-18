import { smpApi } from '../baseApi';
import { Partner } from '@/types/master-data';

export interface GetPartnersResponse {
  message: string;
  data: Partner[];
}

export const partnerApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getPartners: builder.query<GetPartnersResponse, void>({
      query: () => 'partners', // Assuming endpoint is /partners
      providesTags: ['Partner'],
    }),
  }),
});

export const { useGetPartnersQuery } = partnerApi;