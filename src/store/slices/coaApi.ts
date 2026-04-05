import { bankSmpApi } from "../bankBaseApi";

export interface Coa {
  coa_code: string;
  account_name: string;
  account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE' | string;
  level: 'HEADER' | 'SUBHEADER' | 'DETAIL' | string;
  parent_coa_code?: string | null;
  is_postable: boolean | string;
  children?: Coa[];
  is_active?: boolean;
}

export interface CreateUpdateCoaRequest {
  coa_code: string;
  account_name: string;
  account_type: string;
  level: string;
  parent_coa_code?: string | null;
  is_postable: boolean;
}

export interface TransactionType {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  is_debit: boolean;
  is_credit: boolean;
  default_debit_coa?: string;
  default_credit_coa?: string;
  is_active: boolean;
}

export const coaApi = bankSmpApi.injectEndpoints({
  endpoints: (builder) => ({
    getCoa: builder.query<Coa[], void>({
      query: () => "/master/chart-of-account",
      transformResponse: (res: any) => res.data?.data || res.data || [],
      providesTags: ['Coa'],
    }),
    getHeaderAccounts: builder.query<Coa[], void>({
      query: () => "/master/chart-of-account",
      transformResponse: (res: any) => {
        const data = res.data?.data || res.data || [];
        return Array.isArray(data) ? data.filter((item: Coa) => item.level === 'HEADER' || item.level === 'SUBHEADER') : [];
      },
    }),
    getDetailAccounts: builder.query<Coa[], void>({
      query: () => "/master/chart-of-account",
      transformResponse: (res: any) => {
        const data = res.data?.data || res.data || [];
        // Flatten or filter for DETAIL accounts
        const details: Coa[] = [];
        const extractDetails = (items: Coa[]) => {
          items.forEach(item => {
            if (item.level === 'DETAIL') {
              details.push(item);
            }
            if (item.children && item.children.length > 0) {
              extractDetails(item.children);
            }
          });
        };
        extractDetails(data);
        return details;
      },
    }),
    createCoa: builder.mutation<Coa, CreateUpdateCoaRequest>({
      query: (data) => ({
        url: "/master/chart-of-account",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Coa'],
    }),
    updateCoa: builder.mutation<Coa, { id: string; data: CreateUpdateCoaRequest }>({
      query: ({ id, data }) => ({
        url: `/master/chart-of-account/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ['Coa'],
    }),
    deleteCoa: builder.mutation<void, string>({
      query: (id) => ({
        url: `/master/chart-of-account/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Coa'],
    }),
    
    // Transaction Types for config
    getConfigTransactionTypes: builder.query<{ status: string; data: TransactionType[] }, void>({
      query: () => "/main/transaction-type",
      providesTags: ['TransactionType'],
    }),
    updateConfigTransactionType: builder.mutation<TransactionType, { id: number; data: Partial<TransactionType> }>({
      query: ({ id, data }) => ({
        url: `/main/transaction-type/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["TransactionType"],
    }),
  }),
});

export const {
  useGetCoaQuery,
  useGetHeaderAccountsQuery,
  useGetDetailAccountsQuery,
  useCreateCoaMutation,
  useUpdateCoaMutation,
  useDeleteCoaMutation,
  useGetConfigTransactionTypesQuery,
  useUpdateConfigTransactionTypeMutation,
} = coaApi;