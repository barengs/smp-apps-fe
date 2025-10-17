import { smpApi } from '../baseApi';
import { TransaksiApiResponse, SingleTransaksiApiResponse, Transaksi } from '@/types/keuangan';
import { PaginatedResponse, PaginationParams } from '@/types/master-data';

const asPaginated = (data: any): PaginatedResponse<Transaksi> => {
  if (data && typeof data === 'object' && 'data' in data) return data as PaginatedResponse<Transaksi>;
  const arr = Array.isArray(data) ? data : [];
  return {
    current_page: 1,
    data: arr,
    first_page_url: '',
    from: arr.length ? 1 : 0,
    last_page: 1,
    last_page_url: '',
    links: [],
    next_page_url: null,
    path: '',
    per_page: arr.length || 10,
    prev_page_url: null,
    to: arr.length,
    total: arr.length,
  };
};

export const bankApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<PaginatedResponse<Transaksi>, PaginationParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params.sort_order) queryParams.append('sort_order', params.sort_order);
        return `main/transaction?${queryParams.toString()}`;
      },
      transformResponse: (response: TransaksiApiResponse) => asPaginated(response.data),
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
    getTransactionsByAccount: builder.query<PaginatedResponse<Transaksi>, { accountNumber: string; days?: number; page?: number; per_page?: number; sort_by?: string; sort_order?: 'asc' | 'desc' }>({
      query: ({ accountNumber, days, page, per_page, sort_by, sort_order }) => {
        const queryParams = new URLSearchParams();
        if (days) queryParams.append('days', days.toString());
        if (page) queryParams.append('page', page.toString());
        if (per_page) queryParams.append('per_page', per_page.toString());
        if (sort_by) queryParams.append('sort_by', sort_by);
        if (sort_order) queryParams.append('sort_order', sort_order);
        return `main/account/${accountNumber}/transactions?${queryParams.toString()}`;
      },
      transformResponse: (response: TransaksiApiResponse) => asPaginated(response.data),
      providesTags: (result, error, { accountNumber }) => [{ type: 'Transaksi', id: `LIST-${accountNumber}` }],
    }),
    getTransactionsByAccountLast7Days: builder.query<PaginatedResponse<Transaksi>, { accountNumber: string; page?: number; per_page?: number; sort_by?: string; sort_order?: 'asc' | 'desc' }>({
      query: ({ accountNumber, page, per_page, sort_by, sort_order }) => {
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('page', page.toString());
        if (per_page) queryParams.append('per_page', per_page.toString());
        if (sort_by) queryParams.append('sort_by', sort_by);
        if (sort_order) queryParams.append('sort_order', sort_order);
        return `main/transaction/account/${accountNumber}/last-7-days?${queryParams.toString()}`;
      },
      transformResponse: (response: TransaksiApiResponse) => asPaginated(response.data),
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