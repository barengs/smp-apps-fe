import { smpApi } from '../baseApi';

// --- API Response and Request Types ---

// Interface disesuaikan dengan struktur data dari endpoint /product
export interface ProdukBank {
  product_code: string;
  product_name: string;
  // Asumsi tipe produk selain SAVINGS adalah FINANCING
  product_type: 'SAVINGS' | 'CHECKING' | 'LOAN' | 'TIME_DEPOSIT'; // Diperbarui
  interest_rate: number;
  admin_fee: number;
  is_active: boolean;
}

interface GetProdukBankResponse {
  message: string;
  data: ProdukBank[];
}

// Request interface disesuaikan untuk create/update
export interface CreateUpdateProdukBankRequest {
  product_code?: string; // Ditambahkan, opsional karena tidak selalu ada (misal saat update)
  product_name: string;
  product_type: 'SAVINGS' | 'CHECKING' | 'LOAN' | 'TIME_DEPOSIT'; // Diperbarui
  interest_rate: number;
  admin_fee: number;
  is_active: boolean;
}

export const produkBankApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getProdukBank: builder.query<GetProdukBankResponse, void>({
      query: () => 'product', // Endpoint diubah ke /product
      providesTags: ['ProdukBank'],
    }),
    createProdukBank: builder.mutation<ProdukBank, CreateUpdateProdukBankRequest>({
      query: (newProduk) => ({
        url: 'product', // Endpoint diubah ke /product
        method: 'POST',
        body: newProduk,
      }),
      invalidatesTags: ['ProdukBank'],
    }),
    updateProdukBank: builder.mutation<ProdukBank, { id: string; data: CreateUpdateProdukBankRequest }>({
        query: ({ id, data }) => ({
            url: `product/${id}`, // Endpoint diubah dan id sekarang adalah product_code (string)
            method: 'PUT',
            body: data,
        }),
        invalidatesTags: ['ProdukBank'],
    }),
    deleteProdukBank: builder.mutation<{ message: string }, string>({
        query: (id) => ({
            url: `product/${id}`, // Endpoint diubah dan id sekarang adalah product_code (string)
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