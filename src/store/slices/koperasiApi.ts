import { bankSmpApi } from '../bankBaseApi';
import { KoperasiCheckResponse, KoperasiDebitRequest, KoperasiTransaction } from '@/types/keuangan';
import { PaginatedResponse, PaginationParams } from '@/types/master-data';

export const koperasiApi = bankSmpApi.injectEndpoints({
  endpoints: (builder) => ({
    checkNis: builder.query<KoperasiCheckResponse, string>({
      query: (nis) => `koperasi/check/${nis}`,
      // Kita mungkin tidak butuh banyak caching di sini karena saldo cepat berubah
      providesTags: (result, error, nis) => [{ type: 'Account', id: nis }],
      transformResponse: (response: { data: KoperasiCheckResponse }) => response.data,
    }),
    debitKoperasi: builder.mutation<any, KoperasiDebitRequest>({
      query: (data) => ({
        url: 'koperasi/debit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { account_number }) => [
        { type: 'Account', id: account_number },
        'Payment',
        'TopUp',
        'KoperasiTransaction'
      ],
    }),
    getKoperasiTransactions: builder.query<PaginatedResponse<KoperasiTransaction>, PaginationParams & { account_number?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.account_number) queryParams.append('account_number', params.account_number);
        return `koperasi/transactions?${queryParams.toString()}`;
      },
      providesTags: ['KoperasiTransaction'],
      transformResponse: (response: { data: PaginatedResponse<KoperasiTransaction> }) => response.data,
    }),
  }),
});

export const {
  useCheckNisQuery,
  useDebitKoperasiMutation,
  useGetKoperasiTransactionsQuery,
} = koperasiApi;
