import { smpApi } from '../baseApi';
// import { Parent, CreateUpdateParentRequest } from '@/types/kepesantrenan';
import { PaginatedResponse, PaginationParams } from '@/types/master-data';

export interface Parent {
  id: number;
  email: string;
  created_at?: string;
  students?: any[];
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
    occupation?: string | null;
    education?: string | null;
    photo?: string | null;
  };
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
    occupation?: string | null;
    education?: string | null;
  };
}

export const parentApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getParents: builder.query<PaginatedResponse<Parent>, PaginationParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params.sort_order) queryParams.append('sort_order', params.sort_order);
        return `master/parent?${queryParams.toString()}`;
      },
      transformResponse: (response: { data: PaginatedResponse<Parent> }) => response.data,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Parent' as const, id })),
              { type: 'Parent', id: 'LIST' },
            ]
          : [{ type: 'Parent', id: 'LIST' }],
    }),
    getParentById: builder.query<Parent, number>({
      query: (id) => `master/parent/${id}`,
      providesTags: (result, error, id) => [{ type: 'Parent', id }],
    }),
    createParent: builder.mutation<Parent, CreateUpdateParentRequest>({
      query: (newParent) => ({
        url: 'master/parent',
        method: 'POST',
        body: newParent,
      }),
      invalidatesTags: [{ type: 'Parent', id: 'LIST' }],
    }),
    updateParent: builder.mutation<Parent, { id: number; data: CreateUpdateParentRequest }>({
      query: ({ id, data }) => ({
        url: `master/parent/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Parent', id }, { type: 'Parent', id: 'LIST' }],
    }),
    deleteParent: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/parent/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Parent', id: 'LIST' }],
    }),
    getParentByNik: builder.query<Parent, string>({
      query: (nik) => `master/parent/nik/${nik}`,
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