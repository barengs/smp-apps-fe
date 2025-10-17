import { smpApi } from '../baseApi';
import { TransactionType, CreateUpdateTransactionTypeRequest, PaginatedTransactionTypes, TransactionTypeApiResponse } from '@/types/keuangan';
import { PaginationParams } from '@/types/master-data';

export const transactionTypeApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransactionTypes: builder.query<PaginatedTransactionTypes, PaginationParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params.sort_order) queryParams.append('sort_order', params.sort_order);
        return `main/transaction-type?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'TransactionType' as const, id })),
              { type: 'TransactionType', id: 'LIST' },
            ]
          : [{ type: 'TransactionType', id: 'LIST' }],
      transformResponse: (response: { data: PaginatedTransactionTypes }) => {
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
      invalidatesTags: [{ type: 'TransactionType', id: 'LIST' }],
    }),
    updateTransactionType: builder.mutation<TransactionType, { id: number; data: CreateUpdateTransactionTypeRequest }>({
        query: ({ id, data }) => ({
            url: `main/transaction-type/${id}`,
            method: 'PUT',
            body: data,
        }),
        invalidatesTags: (result, error, { id }) => [{ type: 'TransactionType', id }, { type: 'TransactionType', id: 'LIST' }],
    }),
    deleteTransactionType: builder.mutation<{ message: string }, number>({
        query: (id) => ({
            url: `main/transaction-type/${id}`,
            method: 'DELETE',
        }),
        invalidatesTags: [{ type: 'TransactionType', id: 'LIST' }],
    }),
  }),
});

export const { 
    useGetTransactionTypesQuery, 
    useCreateTransactionTypeMutation,
    useUpdateTransactionTypeMutation,
    useDeleteTransactionTypeMutation,
} = transactionTypeApi;