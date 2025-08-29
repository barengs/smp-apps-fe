import { smpApi } from '../baseApi';
import { TransaksiApiResponse, SingleTransaksiApiResponse } from '@/types/keuangan';

export const bankApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<TransaksiApiResponse, void>({
      query: () => 'transaction',
      providesTags: ['Transaksi'], // Perbaikan: Mengubah 'Transaction' menjadi 'Transaksi'
    }),
    getTransactionById: builder.query<SingleTransaksiApiResponse, string>({
      query: (id) => `transaction/${id}`,
      providesTags: (result, error, id) => [{ type: 'Transaksi', id }], // Perbaikan: Mengubah 'Transaction' menjadi 'Transaksi'
    }),
    getTransactionsByAccount: builder.query<TransaksiApiResponse, { accountNumber: string; days?: number }>({
      query: ({ accountNumber, days }) => {
        let url = `account/${accountNumber}/transactions`;
        if (days) {
          url += `?days=${days}`;
        }
        return url;
      },
      providesTags: (result, error, { accountNumber }) => [{ type: 'Transaksi', id: `LIST-${accountNumber}` }], // Perbaikan: Mengubah 'Transaction' menjadi 'Transaksi'
    }),
    validateTransaction: builder.mutation<{ message: string }, { id: string; paidAmount: number }>({
      query: ({ id, paidAmount }) => ({
        url: `transaction/${id}/validate`,
        method: 'POST',
        body: { paid_amount: paidAmount },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Transaksi', id }, 'Transaksi'], // Perbaikan: Mengubah 'Transaction' menjadi 'Transaksi'
    }),
    addTransaction: builder.mutation<any, { destination_account: string; transaction_type: string; amount: string; description: string }>({
      query: (newTransaction) => ({
        url: 'transaction',
        method: 'POST',
        body: newTransaction,
      }),
      invalidatesTags: ['Transaksi'], // Invalidate all transactions list after adding a new one
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useGetTransactionByIdQuery,
  useGetTransactionsByAccountQuery,
  useValidateTransactionMutation,
  useAddTransactionMutation, // Menambahkan export untuk hook baru
} = bankApi;