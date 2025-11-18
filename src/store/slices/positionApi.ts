"use client";

import { smpApi } from '../baseApi';

export interface Position {
  id: number;
  name: string;
}

interface GetPositionsResponse {
  message: string;
  data: Position[];
}

export const positionApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getPositions: builder.query<Position[], void>({
      query: () => 'master/position',
      transformResponse: (response: GetPositionsResponse) => response.data,
      providesTags: ['Employee'], // tag tidak terlalu penting di sini, gunakan yang ada
    }),
  }),
});

export const { useGetPositionsQuery } = positionApi;