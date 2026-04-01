import { bankSmpApi } from "../bankBaseApi";

export interface LedgerEntry {
  id: number;
  transaction_id: string;
  coa_code: string;
  account_name: string;
  debit: number;
  credit: number;
  description: string;
  created_at: string;
  transaction?: {
    reference_number: string;
    transaction_type?: {
      name: string;
    }
  }
}

export interface MovementEntry {
  id: number;
  account_number: string;
  amount: number;
  type: 'debit' | 'credit';
  balance_before: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export interface RekapSaldoItem {
  product_name: string;
  total_accounts: number;
  total_balance: number;
}

export interface RekapKasirData {
  date: string;
  income: { name: string; total: number }[];
  expense: { name: string; total: number }[];
  net: number;
}

export const reportApi = bankSmpApi.injectEndpoints({
  endpoints: (builder) => ({
    getJurnalUmum: builder.query<{ status: string; data: { data: LedgerEntry[], total: number } }, { start_date?: string; end_date?: string; page?: number }>({
      query: (params) => ({
        url: "/main/report/jurnal-umum",
        params,
      }),
    }),
    getMutasiNasabah: builder.query<{ status: string; account: any; data: MovementEntry[] }, { accountNumber: string; start_date?: string; end_date?: string }>({
      query: ({ accountNumber, ...params }) => ({
        url: `/main/report/mutasi-nasabah/${accountNumber}`,
        params,
      }),
    }),
    getRekapSaldo: builder.query<{ status: string; data: RekapSaldoItem[]; total_all: number }, void>({
      query: () => "/main/report/rekap-saldo",
    }),
    getRekapKasir: builder.query<{ status: string; data: RekapKasirData }, { date?: string }>({
      query: (params) => ({
        url: "/main/report/rekap-kasir",
        params,
      }),
      transformResponse: (response: any) => ({
        status: response.status,
        data: response
      })
    }),
  }),
});

export const {
  useGetJurnalUmumQuery,
  useGetMutasiNasabahQuery,
  useGetRekapSaldoQuery,
  useGetRekapKasirQuery,
} = reportApi;
