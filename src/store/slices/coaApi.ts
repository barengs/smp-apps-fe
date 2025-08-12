import { smpApi } from '../baseApi';

export interface Coa {
  id: number;
  kode_akun: string;
  nama_akun: string;
  posisi_akun: 'debit' | 'kredit';
  kategori_akun: 'aset' | 'liabilitas' | 'ekuitas' | 'pendapatan' | 'beban';
  parent_id?: number | null;
  parent?: { nama_akun: string } | null;
  level: number;
  saldo_awal: number;
  status: 'aktif' | 'tidak_aktif';
  created_at: string;
  updated_at: string;
}

interface GetCoaResponse {
  message: string;
  data: Coa[];
}

export interface CreateUpdateCoaRequest {
  kode_akun: string;
  nama_akun: string;
  posisi_akun: 'debit' | 'kredit';
  kategori_akun: 'aset' | 'liabilitas' | 'ekuitas' | 'pendapatan' | 'beban';
  parent_id?: number | null;
  saldo_awal: number;
  status: 'aktif' | 'tidak_aktif';
}

export const coaApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getCoa: builder.query<GetCoaResponse, void>({
      query: () => 'bank-santri/coa',
      providesTags: ['Coa'],
    }),
    createCoa: builder.mutation<Coa, CreateUpdateCoaRequest>({
      query: (newCoa) => ({
        url: 'bank-santri/coa',
        method: 'POST',
        body: newCoa,
      }),
      invalidatesTags: ['Coa'],
    }),
    updateCoa: builder.mutation<Coa, { id: number; data: CreateUpdateCoaRequest }>({
        query: ({ id, data }) => ({
            url: `bank-santri/coa/${id}`,
            method: 'PUT',
            body: data,
        }),
        invalidatesTags: ['Coa'],
    }),
    deleteCoa: builder.mutation<{ message: string }, number>({
        query: (id) => ({
            url: `bank-santri/coa/${id}`,
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