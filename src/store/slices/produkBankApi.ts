import { smpApi } from '../baseApi';

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

interface GetProdukBankResponse {
  message: string;
  data: ProdukBank[];
}

export const produkBankApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getProdukBank: builder.query<GetProdukBankResponse, void>({
      query: () => 'master/product',
      providesTags: ['ProdukBank'],
    }),
    createProdukBank: builder.mutation<ProdukBank, CreateUpdateProdukBankRequest>({
      query: (newProduk) => ({
        url: 'master/product',
        method: 'POST',
        body: newProduk,
      }),
      invalidatesTags: ['ProdukBank'],
    }),
    updateProdukBank: builder.mutation<ProdukBank, { id: string; data: CreateUpdateProdukBankRequest }>({
      query: ({ id, data }) => ({
        url: `master/product/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['ProdukBank'],
    }),
    deleteProdukBank: builder.mutation<void, string>({
      query: (id) => ({
        url: `master/product/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ProdukBank'],
    }),
  }),
});

export const { useGetProdukBankQuery, useCreateProdukBankMutation, useUpdateProdukBankMutation, useDeleteProdukBankMutation } = produkBankApi;