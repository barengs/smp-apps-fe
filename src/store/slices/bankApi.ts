import { smpApi } from '../baseApi';
import { TransaksiApiResponse, SingleTransaksiApiResponse, Transaksi } from '@/types/keuangan';
import { PaginatedResponse, PaginationParams } from '@/types/master-data'; // Import PaginatedResponse and PaginationParams

export const bankApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<PaginatedResponse<Transaksi>, PaginationParams>({ // Update return type and add params
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params.sort_order) queryParams.append('sort_order', params.sort_order);
        return `main/transaction?${queryParams.toString()}`;
      },
      transformResponse: (response: TransaksiApiResponse) => response.data as PaginatedResponse<Transaksi>, // Adjust transformResponse
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Transaksi' as const, id })),
              { type: 'Transaksi', id: 'LIST' },
            ]
          : [{ type: 'Transaksi', id: 'LIST' }],
    }),
    getTransactionById: builder.query<SingleTransaksiApiResponse, string>({
      query: (id) => `main/transaction/${id}`,
      providesTags: (result, error, id) => [{ type: 'Transaksi', id }],
    }),
    getTransactionsByAccount: builder.query<PaginatedResponse<Transaksi>, { accountNumber: string; days?: number; page?: number; per_page?: number; sort_by?: string; sort_order?: 'asc' | 'desc' }>({ // Update return type and add params
      query: ({ accountNumber, days, page, per_page, sort_by, sort_order }) => {
        const queryParams = new URLSearchParams();
        if (days) queryParams.append('days', days.toString());
        if (page) queryParams.append('page', page.toString());
        if (per_page) queryParams.append('per_page', per_page.toString());
        if (sort_by) queryParams.append('sort_by', sort_by);
        if (sort_order) queryParams.append('sort_order', sort_order);
        return `main/account/${accountNumber}/transactions?${queryParams.toString()}`;
      },
      transformResponse: (response: TransaksiApiResponse) => response.data as PaginatedResponse<Transaksi>, // Adjust transformResponse
      providesTags: (result, error, { accountNumber }) => [{ type: 'Transaksi', id: `LIST-${accountNumber}` }],
    }),
    getTransactionsByAccountLast7Days: builder.query<PaginatedResponse<Transaksi>, { accountNumber: string; page?: number; per_page?: number; sort_by?: string; sort_order?: 'asc' | 'desc' }>({ // Update return type and add params
      query: ({ accountNumber, page, per_page, sort_by, sort_order }) => {
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('page', page.toString());
        if (per_page) queryParams.append('per_page', per_page.toString());
        if (sort_by) queryParams.append('sort_by', sort_by);
        if (sort_order) queryParams.append('sort_order', sort_order);
        return `main/transaction/account/${accountNumber}/last-7-days?${queryParams.toString()}`;
      },
      transformResponse: (response: TransaksiApiResponse) => response.data as PaginatedResponse<Transaksi>, // Adjust transformResponse
      providesTags: (result, error, accountNumber) => [{ type: 'Transaksi', id: `LIST-${accountNumber}-7DAYS` }],
    }),
    validateTransaction: builder.mutation<{ message: string }, { id: string }>({
      query: ({ id }) => ({
        url: `main/transaction/${id}/activate`,
        method: 'PUT', // Perbaikan: Mengubah metode dari POST menjadi PUT
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Transaksi', id }, 'Transaksi'],
    }),
    addTransaction: builder.mutation<any, { destination_account: string; transaction_type: string; amount: string; description: string }>({
      query: (newTransaction) => ({
        url: 'main/transaction',
        method: 'POST',
        body: newTransaction,
      }),
      invalidatesTags: [{ type: 'Transaksi', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useGetTransactionByIdQuery,
  useGetTransactionsByAccountQuery,
  useGetTransactionsByAccountLast7DaysQuery,
  useValidateTransactionMutation,
  useAddTransactionMutation,
} = bankApi;