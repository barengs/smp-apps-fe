import { bankSmpApi } from '../bankBaseApi';
import { Account, CreateUpdateAccountRequest } from '@/types/keuangan';
import { PaginatedResponse, PaginationParams } from '@/types/master-data';

export const accountApi = bankSmpApi.injectEndpoints({
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
      transformResponse: (response: any): PaginatedResponse<Account> => {
        const raw = response?.data;
        if (Array.isArray(raw)) {
          const data = raw as Account[];
          return {
            current_page: 1,
            data,
            first_page_url: '',
            from: data.length > 0 ? 1 : 0,
            last_page: 1,
            last_page_url: '',
            links: [],
            next_page_url: null,
            path: '',
            per_page: data.length,
            prev_page_url: null,
            to: data.length,
            total: data.length,
          };
        }
        if (raw && Array.isArray(raw?.data)) {
          return raw as PaginatedResponse<Account>;
        }
        if (Array.isArray(response?.data?.data)) {
          return response.data as PaginatedResponse<Account>;
        }
        return {
          current_page: 1,
          data: [],
          first_page_url: '',
          from: 0,
          last_page: 1,
          last_page_url: '',
          links: [],
          next_page_url: null,
          path: '',
          per_page: 0,
          prev_page_url: null,
          to: 0,
          total: 0,
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ account_number }) => ({ type: 'Account' as const, id: account_number })),
              { type: 'Account', id: 'LIST' },
            ]
          : [{ type: 'Account', id: 'LIST' }],
    }),
    getAccountById: builder.query<Account, number | string>({
      query: (id) => `main/account/${id}`,
      transformResponse: (response: any) =>
        (response as any)?.data ?? response,
      providesTags: (result, error, id) => [{ type: 'Account', id }],
    }),
    getByAccountNumber: builder.query<{data: Account}, string>({
      query: (accountNumber) => `main/account/${accountNumber}`,
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
    updateAccount: builder.mutation<Account, { id: number | string; data: CreateUpdateAccountRequest }>({
      query: ({ id, data }) => ({
        url: `main/account/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Account', id }, { type: 'Account', id: 'LIST' }],
    }),
    deleteAccount: builder.mutation<void, number | string>({
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
  useGetByAccountNumberQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
} = accountApi;