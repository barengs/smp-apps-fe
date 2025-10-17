import { smpApi } from '../baseApi';
import { PaginatedResponse, PaginationParams } from '@/types/master-data';

export interface Parent {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  parent: {
    id: number;
    kk: string;
    nik: string;
    parent_id: number | null;
    user_id: string;
    parent_as: string;
    first_name: string;
    last_name: string | null;
    gender: string;
    card_address: string | null;
    domicile_address: string | null;
    village_id: number | null;
    phone: string | null;
    email: string | null;
    occupation_id: number | null;
    education_id: number | null;
    photo: string | null;
    photo_path: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
  };
  roles: Array<{
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    pivot: {
      model_type: string;
      model_id: string;
      role_id: string;
    };
  }>;
}

export interface CreateUpdateParentRequest {
  email: string;
  parent: {
    first_name: string;
    last_name?: string | null;
    kk: string;
    nik: string;
    gender: string;
    parent_as: string;
    phone?: string | null;
    email?: string | null;
    domicile_address?: string | null;
    card_address?: string | null;
    occupation_id?: number | null;
    education_id?: number | null;
  };
}

export const parentApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getParents: builder.query<Parent[], void>({
      query: () => 'main/parent',
      transformResponse: (response: { data: Parent[] }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Parent' as const, id })),
              { type: 'Parent', id: 'LIST' },
            ]
          : [{ type: 'Parent', id: 'LIST' }],
    }),
    getParentById: builder.query<Parent, number>({
      query: (id) => `main/parent/parent/${id}`,
      providesTags: (result, error, id) => [{ type: 'Parent', id }],
    }),
    createParent: builder.mutation<Parent, CreateUpdateParentRequest>({
      query: (newParent) => ({
        url: 'main/parent',
        method: 'POST',
        body: newParent,
      }),
      invalidatesTags: [{ type: 'Parent', id: 'LIST' }],
    }),
    updateParent: builder.mutation<Parent, { id: number; data: CreateUpdateParentRequest }>({
      query: ({ id, data }) => ({
        url: `main/parent/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Parent', id }, { type: 'Parent', id: 'LIST' }],
    }),
    deleteParent: builder.mutation<void, number>({
      query: (id) => ({
        url: `main/parent/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Parent', id: 'LIST' }],
    }),
    getParentByNik: builder.query<Parent, string>({
      query: (nik) => `main/parent/nik/${nik}`,
      providesTags: (result, error, nik) => [{ type: 'Parent', id: nik }],
    }),
  }),
});

export const {
  useGetParentsQuery,
  useGetParentByIdQuery,
  useCreateParentMutation,
  useUpdateParentMutation,
  useDeleteParentMutation,
  useGetParentByNikQuery,
  useLazyGetParentByNikQuery,
} = parentApi;