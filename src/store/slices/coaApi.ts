import { smpApi } from '../baseApi';

export interface Coa {
  coa_code: string;
  account_name: string;
  account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  parent_coa_code: string | null;
  is_postable: boolean;
}

interface GetCoaResponse {
  message: string;
  data: Coa[];
}

export interface CreateUpdateCoaRequest {
  coa_code: string;
  account_name: string;
  account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  parent_coa_code?: string | null;
  is_postable: boolean;
}

export const coaApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getCoa: builder.query<GetCoaResponse, void>({
      query: () => 'chart-of-account',
      providesTags: ['Coa'],
    }),
    createCoa: builder.mutation<Coa, CreateUpdateCoaRequest>({
      query: (newCoa) => ({
        url: 'chart-of-account',
        method: 'POST',
        body: newCoa,
      }),
      invalidatesTags: ['Coa'],
    }),
    updateCoa: builder.mutation<Coa, { id: string; data: CreateUpdateCoaRequest }>({
        query: ({ id, data }) => ({
            url: `chart-of-account/${id}`,
            method: 'PUT',
            body: data,
        }),
        invalidatesTags: ['Coa'],
    }),
    deleteCoa: builder.mutation<{ message: string }, string>({
        query: (id) => ({
            url: `chart-of-account/${id}`,
            method: 'DELETE',
        }),
        invalidatesTags: ['Coa'],
    }),
  }),
});

export const { 
    useGetCoaQuery, 
    useCreateCoaMutation,
    useUpdateCoaMutation,
    useDeleteCoaMutation,
} = coaApi;