import { smpApi } from '../baseApi';

export interface Coa {
  coa_code: string;
  account_name: string;
  account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  level: 'HEADER' | 'SUBHEADER' | 'DETAIL'; // New field
  parent_coa_code: string | null;
  is_postable: boolean;
  is_active: string; // Ditambahkan berdasarkan contoh data
  created_at: string; // Ditambahkan berdasarkan contoh data
  updated_at: string; // Ditambahkan berdasarkan contoh data
  children: any[]; // Ditambahkan berdasarkan contoh data
}

// Interface GetCoaResponse dihapus karena API mengembalikan array Coa[] secara langsung

export interface CreateUpdateCoaRequest {
  coa_code: string;
  account_name: string;
  account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  level: 'HEADER' | 'SUBHEADER' | 'DETAIL'; // New field
  parent_coa_code?: string | null;
  is_postable: boolean;
}

export const coaApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getCoa: builder.query<Coa[], void>({ // Tipe kembalian diubah menjadi Coa[]
      query: () => 'master/chart-of-account',
      providesTags: ['Coa'],
    }),
    getHeaderAccounts: builder.query<Coa[], void>({ // New endpoint for header accounts
      query: () => 'master/chart-of-account/header-accounts',
      providesTags: ['Coa'], // Still provides 'Coa' tag for invalidation
    }),
    getDetailAccounts: builder.query<Coa[], void>({ // New endpoint for detail accounts
      query: () => 'master/chart-of-account/detail-accounts',
      providesTags: ['Coa'],
    }),
    createCoa: builder.mutation<Coa, CreateUpdateCoaRequest>({
      query: (newCoa) => ({
        url: 'master/chart-of-account',
        method: 'POST',
        body: newCoa,
      }),
      invalidatesTags: ['Coa'],
    }),
    updateCoa: builder.mutation<Coa, { id: string; data: CreateUpdateCoaRequest }>({
        query: ({ id, data }) => ({
            url: `master/chart-of-account/${id}`,
            method: 'PUT',
            body: data,
        }),
        invalidatesTags: ['Coa'],
    }),
    deleteCoa: builder.mutation<{ message: string }, string>({
        query: (id) => ({
            url: `master/chart-of-account/${id}`,
            method: 'DELETE',
        }),
        invalidatesTags: ['Coa'],
    }),
  }),
});

export const { 
    useGetCoaQuery, 
    useGetHeaderAccountsQuery, // Export the new hook
    useGetDetailAccountsQuery, // Export the new hook
    useCreateCoaMutation,
    useUpdateCoaMutation,
    useDeleteCoaMutation,
} = coaApi;