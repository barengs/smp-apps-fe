"use client";

import { smpApi } from '../baseApi';
import { Organization } from './organizationApi';
import { PositionAssignment } from './positionAssignmentApi';

export interface Position {
  id: number;
  name: string;
  code: string;
  description: string | null;
  organization_id: number;
  parent_id: number | null;
  level: number;
  is_active: boolean;
  organization?: Organization;
  parent?: Position;
  children?: Position[];
  assignments?: PositionAssignment[];
}

interface GetPositionsResponse {
  message: string;
  data: Position[];
}

interface GetPositionResponse {
  message: string;
  data: Position;
}

export const positionApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getPositions: builder.query<Position[], void>({
      query: () => 'master/position',
      transformResponse: (response: GetPositionsResponse) => response.data,
      providesTags: ['Position'],
    }),
    getPosition: builder.query<Position, number>({
      query: (id) => `master/position/${id}`,
      transformResponse: (response: GetPositionResponse) => response.data,
      providesTags: (result, error, id) => [{ type: 'Position', id }],
    }),
    getPositionsByOrganization: builder.query<Position[], number>({
      query: (orgId) => `master/position/organization/${orgId}`,
      transformResponse: (response: GetPositionsResponse) => response.data,
      providesTags: ['Position'],
    }),
    createPosition: builder.mutation<Position, Partial<Position>>({
      query: (body) => ({
        url: 'master/position',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Position'],
    }),
    updatePosition: builder.mutation<Position, { id: number; data: Partial<Position> }>({
      query: ({ id, data }) => ({
        url: `master/position/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Position', id }, 'Position'],
    }),
    deletePosition: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/position/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Position'],
    }),
  }),
});

export const { 
  useGetPositionsQuery,
  useGetPositionQuery,
  useGetPositionsByOrganizationQuery,
  useCreatePositionMutation,
  useUpdatePositionMutation,
  useDeletePositionMutation,
} = positionApi;