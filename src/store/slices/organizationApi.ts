"use client";

import { smpApi } from '../baseApi';
import { Position } from './positionApi';

export interface Organization {
  id: number;
  name: string;
  description: string | null;
  code: string | null;
  parent_id: number | null;
  level: number;
  is_active: boolean;
  parent?: Organization;
  children?: Organization[];
  positions?: Position[];
}

interface GetOrganizationsResponse {
  message: string;
  data: Organization[];
}

interface GetOrganizationResponse {
  message: string;
  data: Organization;
}

export const organizationApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizations: builder.query<Organization[], void>({
      query: () => 'master/organization',
      transformResponse: (response: GetOrganizationsResponse) => response.data,
      providesTags: ['Organization'],
    }),
    getRootOrganizations: builder.query<Organization[], void>({
      query: () => 'master/organization/root',
      transformResponse: (response: GetOrganizationsResponse) => response.data,
      providesTags: ['Organization'],
    }),
    getOrganizationHierarchy: builder.query<Organization[], void>({
      query: () => 'master/organization/hierarchy',
      transformResponse: (response: GetOrganizationsResponse) => response.data,
      providesTags: ['Organization'],
    }),
    getOrganization: builder.query<Organization, number>({
      query: (id) => `master/organization/${id}`,
      transformResponse: (response: GetOrganizationResponse) => response.data,
      providesTags: (result, error, id) => [{ type: 'Organization', id }],
    }),
    createOrganization: builder.mutation<Organization, Partial<Organization>>({
      query: (body) => ({
        url: 'master/organization',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Organization'],
    }),
    updateOrganization: builder.mutation<Organization, { id: number; data: Partial<Organization> }>({
      query: ({ id, data }) => ({
        url: `master/organization/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Organization', id }, 'Organization'],
    }),
    deleteOrganization: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/organization/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Organization'],
    }),
  }),
});

export const {
  useGetOrganizationsQuery,
  useGetRootOrganizationsQuery,
  useGetOrganizationHierarchyQuery,
  useGetOrganizationQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
} = organizationApi;
