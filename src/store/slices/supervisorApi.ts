import { smpApi } from '../baseApi';
import { Supervisor } from '@/types/master-data';

export interface GetSupervisorsResponse {
  message: string;
  data: Supervisor[];
}

export const supervisorApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getSupervisors: builder.query<GetSupervisorsResponse, void>({
      query: () => 'supervisor',
      providesTags: ['Supervisor'],
    }),
  }),
});

export const { useGetSupervisorsQuery } = supervisorApi;