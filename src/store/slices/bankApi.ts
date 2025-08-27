import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../baseApi';
import { Transaksi, TransaksiApiResponse, SingleTransaksiApiResponse } from '@/types/keuangan';

export const bankApi = createApi({
  reducerPath: 'bankApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Transaksi'],
  endpoints: (builder) => ({
    getTransactions: builder.query<TransaksiApiResponse, void>({
      query: () => '/transaction',
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Transaksi' as const, id })),
              { type: 'Transaksi', id: 'LIST' },
            ]
          : [{ type: 'Transaksi', id: 'LIST' }],
    }),
    getTransactionById: builder.query<SingleTransaksiApiResponse, string>({ // New endpoint
      query: (id) => `/transaction/${id}`,
      providesTags: (result, error, id) => [{ type: 'Transaksi', id }],
    }),
    addTransaction: builder.mutation<SingleTransaksiApiResponse, Partial<Transaksi>>({
      query: (body) => ({
        url: '/transaction',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Transaksi', id: 'LIST' }],
    }),
    validateTransaction: builder.mutation<SingleTransaksiApiResponse, { id: string; paidAmount: number }>({
      query: ({ id, paidAmount }) => ({
        url: `/transaction/${id}/validate`,
        method: 'POST',
        body: { paid_amount: paidAmount },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Transaksi', id }, { type: 'Transaksi', id: 'LIST' }],
    }),
  }),
});

export const { useGetTransactionsQuery, useAddTransactionMutation, useGetTransactionByIdQuery, useValidateTransactionMutation } = bankApi;