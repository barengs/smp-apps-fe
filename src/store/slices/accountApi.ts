import { smpApi } from '../baseApi';
import { AccountApiResponse, SingleAccountApiResponse, CreateUpdateAccountRequest } from '@/types/keuangan';

export const accountApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccounts: builder.query<AccountApiResponse, void>({
      query: () => 'account',
      providesTags: ['Account'],
    }),
    getAccountById: builder.query<SingleAccountApiResponse, string>({
      query: (accountNumber) => `account/${accountNumber}`,
      providesTags: (result, error, accountNumber) => [{ type: 'Account', id: accountNumber }],
    }),
    createAccount: builder.mutation<SingleAccountApiResponse, CreateUpdateAccountRequest>({
      query: (newAccount) => ({
        url: 'account',
        method: 'POST',
        body: newAccount,
      }),
      invalidatesTags: ['Account'],
    }),
    updateAccount: builder.mutation<SingleAccountApiResponse, { accountNumber: string; data: Partial<CreateUpdateAccountRequest> }>({
      query: ({ accountNumber, data }) => ({
        url: `account/${accountNumber}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { accountNumber }) => [{ type: 'Account', id: accountNumber }, 'Account'],
    }),
    deleteAccount: builder.mutation<{ message: string }, string>({
      query: (accountNumber) => ({
        url: `account/${accountNumber}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Account'],
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