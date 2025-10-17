import { smpApi } from '../baseApi';
import { Account, CreateUpdateAccountRequest } from '@/types/keuangan';
import { PaginatedResponse, PaginationParams } from '@/types/master-data';

export const accountApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccounts: builder.query<PaginatedResponse<Account>, PaginationParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params.sort_order) queryParams.append('sort_order', params.sort_order);
        return `main/account?${queryParams.toString()}`;
      },
      transformResponse: (response: { data: PaginatedResponse<Account> }) => response.data,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ account_number }) => ({ type: 'Account' as const, id: account_number })),
              { type: 'Account', id: 'LIST' },
            ]
          : [{ type: 'Account', id: 'LIST' }],
    }),
    getAccountById: builder.query<Account, number>({
      query: (id) => `main/account/${id}`,
      providesTags: (result, error, id) => [{ type: 'Account', id }],
    }),
    createAccount: builder.mutation<Account, CreateUpdateAccountRequest>({
      query: (newAccount) => ({
        url: 'main/account',
        method: 'POST',
        body: newAccount,
      }),
      invalidatesTags: [{ type: 'Account', id: 'LIST' }],
    }),
    updateAccount: builder.mutation<Account, { id: number; data: CreateUpdateAccountRequest }>({
      query: ({ id, data }) => ({
        url: `main/account/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Account', id }, { type: 'Account', id: 'LIST' }],
    }),
    deleteAccount: builder.mutation<void, number>({
      query: (id) => ({
        url: `main/account/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Account', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useGetAccountByIdQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
} = accountApi;