import { bankSmpApi } from '../bankBaseApi';
import { PaginationParams } from '@/types/master-data';

export type TopUpChannel = 'cash' | 'bank_transfer' | 'midtrans';
export type TopUpStatus = 'pending' | 'waiting_verification' | 'success' | 'failed';

export interface TopUpRequest {
  id: number;
  account_number: string;
  payment_package_id?: number | string;
  student_id?: number | string;
  amount: string;
  channel: TopUpChannel;
  status: TopUpStatus;
  payment_ref?: string;
  payment_proof?: string;
  verified_by?: number | string;
  verified_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedTopUpRequests {
  current_page: number;
  data: TopUpRequest[];
  first_page_url: string;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface CashTopUpData {
  account_number: string;
  payment_package_id: number | string;
  amount: number | string;
  notes?: string;
}

export interface BankTransferData {
  account_number: string;
  payment_package_id: number | string;
  amount: number | string;
  payment_proof: File;
  notes?: string;
}

interface ActionResponse {
  status: string;
  message?: string;
  data?: TopUpRequest;
}

export const topUpApi = bankSmpApi.injectEndpoints({
  endpoints: (builder) => ({
    getTopUps: builder.query<PaginatedTopUpRequests, PaginationParams & { status?: string; channel?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.status) queryParams.append('status', params.status);
        if (params.channel) queryParams.append('channel', params.channel);
        return `main/top-up?${queryParams.toString()}`;
      },
      providesTags: ['TopUp'],
      transformResponse: (response: { data: PaginatedTopUpRequests }) => response.data,
    }),
    
    getTopUpByAccount: builder.query<PaginatedTopUpRequests, PaginationParams & { accountNumber: string }>({
      query: ({ accountNumber, ...params }) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        return `main/top-up/account/${accountNumber}?${queryParams.toString()}`;
      },
      providesTags: ['TopUp'],
      transformResponse: (response: { data: PaginatedTopUpRequests }) => response.data,
    }),

    cashTopUp: builder.mutation<ActionResponse, CashTopUpData>({
      query: (data) => ({
        url: 'main/top-up/cash',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TopUp', 'Account', 'Transaksi'],
    }),

    bankTransferTopUp: builder.mutation<ActionResponse, BankTransferData>({
      query: (data) => {
        const formData = new FormData();
        formData.append('account_number', data.account_number);
        formData.append('payment_package_id', data.payment_package_id.toString());
        formData.append('amount', data.amount.toString());
        formData.append('payment_proof', data.payment_proof);
        if (data.notes) formData.append('notes', data.notes);

        return {
          url: 'main/top-up/bank-transfer',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['TopUp'],
    }),

    verifyTopUp: builder.mutation<ActionResponse, { id: number; status: 'success' | 'failed'; notes?: string }>({
      query: ({ id, ...data }) => ({
        url: `main/top-up/${id}/${data.status === 'success' ? 'verify' : 'reject'}`,
        method: 'POST',
        body: { notes: data.notes },
      }),
      invalidatesTags: ['TopUp', 'Account', 'Transaksi'],
    }),
  }),
});

export const {
  useGetTopUpsQuery,
  useGetTopUpByAccountQuery,
  useCashTopUpMutation,
  useBankTransferTopUpMutation,
  useVerifyTopUpMutation,
} = topUpApi;
