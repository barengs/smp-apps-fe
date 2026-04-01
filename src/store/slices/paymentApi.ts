import { bankSmpApi } from '../bankBaseApi';
import { PaymentRecord, CreatePaymentRequest } from '@/types/keuangan';
import { PaginatedResponse, PaginationParams } from '@/types/master-data';

export const paymentApi = bankSmpApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<PaginatedResponse<PaymentRecord>, PaginationParams & { status?: string, package_id?: number, account_number?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.status) queryParams.append('status', params.status);
        if (params.package_id) queryParams.append('package_id', params.package_id.toString());
        if (params.account_number) queryParams.append('account_number', params.account_number);
        return `main/payment?${queryParams.toString()}`;
      },
      providesTags: ['Payment'],
      transformResponse: (response: { data: PaginatedResponse<PaymentRecord> }) => response.data,
    }),
    getPaymentById: builder.query<PaymentRecord, number | string>({
      query: (id) => `main/payment/${id}`,
      providesTags: (result, error, id) => [{ type: 'Payment', id }],
      transformResponse: (response: { data: PaymentRecord }) => response.data,
    }),
    getPaymentsByAccount: builder.query<PaginatedResponse<PaymentRecord>, { accountNumber: string } & PaginationParams>({
      query: ({ accountNumber, ...params }) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        return `main/payment/account/${accountNumber}?${queryParams.toString()}`;
      },
      providesTags: ['Payment'],
      transformResponse: (response: { data: PaginatedResponse<PaymentRecord> }) => response.data,
    }),
    createPayment: builder.mutation<PaymentRecord, CreatePaymentRequest>({
      query: (newPayment) => ({
        url: 'main/payment',
        method: 'POST',
        body: newPayment,
      }),
      invalidatesTags: ['Payment', 'Account', 'TopUp'],
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useGetPaymentsByAccountQuery,
  useCreatePaymentMutation,
} = paymentApi;
