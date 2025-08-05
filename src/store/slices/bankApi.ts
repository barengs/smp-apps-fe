import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../baseApi';
import { Transaksi, TransaksiApiResponse, SingleTransaksiApiResponse } from '@/types/keuangan';

export const bankApi = createApi({
  reducerPath: 'bankApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Transaksi'],
  endpoints: (builder) => ({
    getTransactions: builder.query<TransaksiApiResponse, void>({
      query: () => '/transactions',
      providesTags: (result) =>
        result
          ? [
              ...result.data.data.map(({ id }) => ({ type: 'Transaksi' as const, id })),
              { type: 'Transaksi', id: 'LIST' },
            ]
          : [{ type: 'Transaksi', id: 'LIST' }],
    }),
    addTransaction: builder.mutation<SingleTransaksiApiResponse, Partial<Transaksi>>({
      query: (body) => ({
        url: '/transactions',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Transaksi', id: 'LIST' }],
    }),
  }),
});

export const { useGetTransactionsQuery, useAddTransactionMutation } = bankApi;