import { smpApi } from '../baseApi';

// --- API Response and Request Types ---

export interface ProdukBank {
  id: number;
  nama_produk: string;
  deskripsi: string;
  jenis_produk: 'simpanan' | 'pembiayaan';
  saldo_minimum: number;
  biaya_administrasi: number;
  status: 'aktif' | 'tidak_aktif';
  created_at: string;
  updated_at: string;
}

interface GetProdukBankResponse {
  message: string;
  data: ProdukBank[];
}

export interface CreateUpdateProdukBankRequest {
  nama_produk: string;
  deskripsi: string;
  jenis_produk: 'simpanan' | 'pembiayaan';
  saldo_minimum: number;
  biaya_administrasi: number;
  status: 'aktif' | 'tidak_aktif';
}

export const produkBankApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getProdukBank: builder.query<GetProdukBankResponse, void>({
      query: () => 'bank-santri/produk',
      providesTags: ['ProdukBank'],
    }),
    createProdukBank: builder.mutation<ProdukBank, CreateUpdateProdukBankRequest>({
      query: (newProduk) => ({
        url: 'bank-santri/produk',
        method: 'POST',
        body: newProduk,
      }),
      invalidatesTags: ['ProdukBank'],
    }),
    updateProdukBank: builder.mutation<ProdukBank, { id: number; data: CreateUpdateProdukBankRequest }>({
        query: ({ id, data }) => ({
            url: `bank-santri/produk/${id}`,
            method: 'PUT',
            body: data,
        }),
        invalidatesTags: ['ProdukBank'],
    }),
    deleteProdukBank: builder.mutation<{ message: string }, number>({
        query: (id) => ({
            url: `bank-santri/produk/${id}`,
            method: 'DELETE',
        }),
        invalidatesTags: ['ProdukBank'],
    }),
  }),
});

export const { 
    useGetProdukBankQuery, 
    useCreateProdukBankMutation,
    useUpdateProdukBankMutation,
    useDeleteProdukBankMutation,
} = produkBankApi;