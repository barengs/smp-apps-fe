import { smpApi } from '../baseApi';
import { PaginatedResponse, PaginationParams } from '@/types/master-data'; // Import PaginatedResponse and PaginationParams

export type ProdukType = "Tabungan" | "Deposito" | "Pinjaman";

export interface ProdukBank {
  id: number;
  product_code: string;
  product_name: string;
  product_type: ProdukType; // Updated to enum type
  interest_rate: string; // API returns string, will be coerced in form
  admin_fee: string; // API returns string, will be coerced in form
  opening_fee: string; // New: Biaya Pembukaan
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUpdateProdukBankRequest {
  product_code?: string; // Optional for update, required for create
  product_name: string;
  product_type: ProdukType;
  interest_rate: number; // Expected as number in request body
  admin_fee: number; // Expected as number in request body
  opening_fee: number; // New: Biaya Pembukaan
  is_active: boolean;
}

interface GetProdukBankRawResponse {
  message: string;
  data: PaginatedResponse<ProdukBank>; // Wrap in PaginatedResponse
}

export const produkBankApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getProdukBank: builder.query<PaginatedResponse<ProdukBank>, PaginationParams>({ // Update return type and add params
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params.sort_order) queryParams.append('sort_order', params.sort_order);
        return `master/product?${queryParams.toString()}`;
      },
      transformResponse: (response: GetProdukBankRawResponse) => response.data, // Extract the PaginatedResponse
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'ProdukBank' as const, id })),
              { type: 'ProdukBank', id: 'LIST' },
            ]
          : [{ type: 'ProdukBank', id: 'LIST' }],
    }),
    createProdukBank: builder.mutation<ProdukBank, CreateUpdateProdukBankRequest>({
      query: (newProduk) => ({
        url: 'master/product',
        method: 'POST',
        body: newProduk,
      }),
      invalidatesTags: [{ type: 'ProdukBank', id: 'LIST' }],
    }),
    updateProdukBank: builder.mutation<ProdukBank, { id: string; data: CreateUpdateProdukBankRequest }>({
      query: ({ id, data }) => ({
        url: `master/product/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'ProdukBank', id }, { type: 'ProdukBank', id: 'LIST' }],
    }),
    deleteProdukBank: builder.mutation<void, string>({
      query: (id) => ({
        url: `master/product/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'ProdukBank', id: 'LIST' }],
    }),
  }),
});

export const { useGetProdukBankQuery, useCreateProdukBankMutation, useUpdateProdukBankMutation, useDeleteProdukBankMutation } = produkBankApi;