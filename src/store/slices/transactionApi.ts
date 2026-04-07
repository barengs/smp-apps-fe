import { smpApi } from '../baseApi';

export const transactionApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    validateTransaction: builder.mutation<{ message: string }, { id: string }>({
      query: ({ id }) => ({
        url: `main/transaction/${id}/activate`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Transaksi', id }, 'Transaksi', 'Santri', 'CalonSantri'],
    }),
  }),
});

export const {
  useValidateTransactionMutation,
} = transactionApi;
