import { smpApi } from '../baseApi';
import { AccountApiResponse, SingleAccountApiResponse, CreateUpdateAccountRequest, Account } from '@/types/keuangan';

export const accountApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccounts: builder.query<AccountApiResponse, void>({ // Mengubah tipe kembalian menjadi AccountApiResponse (yang sekarang adalah Account[])
      query: () => 'main/account',
      providesTags: ['Account'],
    }),
    getAccountById: builder.query<Account, string>({ // Mengubah tipe kembalian menjadi Account
      query: (accountNumber) => `main/account/${accountNumber}`,
      providesTags: (result, error, accountNumber) => [{ type: 'Account', id: accountNumber }],
    }),
    createAccount: builder.mutation<SingleAccountApiResponse, CreateUpdateAccountRequest>({
      query: (newAccount) => ({
        url: 'main/account',
        method: 'POST',
        body: newAccount,
      }),
      invalidatesTags: ['Account'],
    }),
    updateAccount: builder.mutation<SingleAccountApiResponse, { accountNumber: string; data: Partial<CreateUpdateAccountRequest> }>({
      query: ({ accountNumber, data }) => ({
        url: `main/account/${accountNumber}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { accountNumber }) => [{ type: 'Account', id: accountNumber }, 'Account'],
    }),
    deleteAccount: builder.mutation<{ message: string }, string>({
      query: (accountNumber) => ({
        url: `main/account/${accountNumber}`,
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