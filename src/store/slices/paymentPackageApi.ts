import { bankSmpApi } from '../bankBaseApi';
import { PaymentPackage, CreateUpdatePaymentPackageRequest } from '@/types/keuangan';
import { PaginatedResponse, PaginationParams } from '@/types/master-data';

export const paymentPackageApi = bankSmpApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentPackages: builder.query<PaginatedResponse<PaymentPackage>, PaginationParams & { is_active?: boolean }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
        return `master/payment-package?${queryParams.toString()}`;
      },
      providesTags: ['PaymentPackage'],
      transformResponse: (response: { data: PaginatedResponse<PaymentPackage> }) => response.data,
    }),
    getPaymentPackageById: builder.query<PaymentPackage, number | string>({
      query: (id) => `master/payment-package/${id}`,
      providesTags: (result, error, id) => [{ type: 'PaymentPackage', id }],
      transformResponse: (response: { data: PaymentPackage }) => response.data,
    }),
    createPaymentPackage: builder.mutation<PaymentPackage, CreateUpdatePaymentPackageRequest>({
      query: (newPackage) => ({
        url: 'master/payment-package',
        method: 'POST',
        body: newPackage,
      }),
      invalidatesTags: ['PaymentPackage'],
    }),
    updatePaymentPackage: builder.mutation<PaymentPackage, { id: number | string; data: CreateUpdatePaymentPackageRequest }>({
      query: ({ id, data }) => ({
        url: `master/payment-package/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'PaymentPackage', id }, 'PaymentPackage'],
    }),
    deletePaymentPackage: builder.mutation<void, number | string>({
      query: (id) => ({
        url: `master/payment-package/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PaymentPackage'],
    }),
  }),
});

export const {
  useGetPaymentPackagesQuery,
  useGetPaymentPackageByIdQuery,
  useCreatePaymentPackageMutation,
  useUpdatePaymentPackageMutation,
  useDeletePaymentPackageMutation,
} = paymentPackageApi;
