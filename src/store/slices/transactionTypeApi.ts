import { smpApi } from '../baseApi';
import { TransactionType, CreateUpdateTransactionTypeRequest, PaginatedTransactionTypes, TransactionTypeApiResponse } from '@/types/keuangan';

export const transactionTypeApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransactionTypes: builder.query<PaginatedTransactionTypes, void>({
      query: () => 'main/transaction-type',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'TransactionType' as const, id })),
              { type: 'TransactionType', id: 'LIST' },
            ]
          : [{ type: 'TransactionType', id: 'LIST' }],
      transformResponse: (response: TransactionTypeApiResponse) => {
        const paginatedData = response.data;
        // Konversi nilai string '1'/'0' menjadi boolean
        const transformedData = paginatedData.data.map((item: any) => ({
          ...item,
          is_debit: item.is_debit == '1' || item.is_debit === true,
          is_credit: item.is_credit == '1' || item.is_credit === true,
          is_active: item.is_active == '1' || item.is_active === true,
        }));
        return { ...paginatedData, data: transformedData };
      },
    }),
    createTransactionType: builder.mutation<TransactionType, CreateUpdateTransactionTypeRequest>({
      query: (newType) => ({
        url: 'main/transaction-type',
        method: 'POST',
        body: newType,
      }),
      invalidatesTags: ['TransactionType'],
    }),
    updateTransactionType: builder.mutation<TransactionType, { id: number; data: CreateUpdateTransactionTypeRequest }>({
        query: ({ id, data }) => ({
            url: `main/transaction-type/${id}`,
            method: 'PUT',
            body: data,
        }),
        invalidatesTags: ['TransactionType'],
    }),
    deleteTransactionType: builder.mutation<{ message: string }, number>({
        query: (id) => ({
            url: `main/transaction-type/${id}`,
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