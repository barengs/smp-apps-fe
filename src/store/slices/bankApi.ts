import { smpApi } from '../baseApi';
import { TransaksiApiResponse, SingleTransaksiApiResponse } from '@/types/keuangan';

export const bankApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<TransaksiApiResponse, void>({
      query: () => 'transaction',
      providesTags: ['Transaksi'],
    }),
    getTransactionById: builder.query<SingleTransaksiApiResponse, string>({
      query: (id) => `transaction/${id}`,
      providesTags: (result, error, id) => [{ type: 'Transaksi', id }],
    }),
    getTransactionsByAccount: builder.query<TransaksiApiResponse, { accountNumber: string; days?: number }>({
      query: ({ accountNumber, days }) => {
        let url = `account/${accountNumber}/transactions`;
        if (days) {
          url += `?days=${days}`;
        }
        return url;
      },
      providesTags: (result, error, { accountNumber }) => [{ type: 'Transaksi', id: `LIST-${accountNumber}` }],
    }),
    validateTransaction: builder.mutation<{ message: string }, { id: string }>({ // Tipe input diubah menjadi hanya { id: string }
      query: ({ id }) => ({ // Hanya id yang diambil dari argumen
        url: `transaction/${id}/activate`, // URL diubah menjadi /activate
        method: 'POST',
        // body: { paid_amount: paidAmount }, // Body dihapus karena tidak dibutuhkan
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Transaksi', id }, 'Transaksi'],
    }),
    addTransaction: builder.mutation<any, { destination_account: string; transaction_type: string; amount: string; description: string }>({
      query: (newTransaction) => ({
        url: 'transaction',
        method: 'POST',
        body: newTransaction,
      }),
      invalidatesTags: ['Transaksi'],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useGetTransactionByIdQuery,
  useGetTransactionsByAccountQuery,
  useValidateTransactionMutation,
  useAddTransactionMutation,
} = bankApi;