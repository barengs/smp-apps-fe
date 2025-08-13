import { smpApi } from '../baseApi';
import { TransactionType, TransactionTypeApiResponse, CreateUpdateTransactionTypeRequest } from '@/types/keuangan';

export const transactionTypeApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransactionTypes: builder.query<TransactionTypeApiResponse, void>({
      query: () => 'transaction-type',
      providesTags: ['TransactionType'],
    }),
    createTransactionType: builder.mutation<TransactionType, CreateUpdateTransactionTypeRequest>({
      query: (newType) => ({
        url: 'transaction-type',
        method: 'POST',
        body: newType,
      }),
      invalidatesTags: ['TransactionType'],
    }),
    updateTransactionType: builder.mutation<TransactionType, { id: number; data: CreateUpdateTransactionTypeRequest }>({
        query: ({ id, data }) => ({
            url: `transaction-type/${id}`,
            method: 'PUT',
            body: data,
        }),
        invalidatesTags: ['TransactionType'],
    }),
    deleteTransactionType: builder.mutation<{ message: string }, number>({
        query: (id) => ({
            url: `transaction-type/${id}`,
            method: 'DELETE',
        }),
        invalidatesTags: ['TransactionType'],
    }),
  }),
});

export const { 
    useGetTransactionTypesQuery, 
    useCreateTransactionTypeMutation,
    useUpdateTransactionTypeMutation,
    useDeleteTransactionTypeMutation,
} = transactionTypeApi;