import { smpApi } from '../baseApi';
import { Account, AccountApiResponse, CreateUpdateAccountRequest } from '@/types/keuangan';

export const accountApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccounts: builder.query<AccountApiResponse, void>({
      query: () => 'bank/account',
      providesTags: ['Account'],
    }),
    createAccount: builder.mutation<Account, CreateUpdateAccountRequest>({
      query: (newAccount) => ({
        url: 'bank/account',
        method: 'POST',
        body: newAccount,
      }),
      invalidatesTags: ['Account'],
    }),
    updateAccount: builder.mutation<Account, { id: number; data: CreateUpdateAccountRequest }>({
      query: ({ id, data }) => ({
        url: `bank/account/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Account'],
    }),
    deleteAccount: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `bank/account/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Account'],
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
} = accountApi;