import { smpApi } from '../baseApi';
import { CalonSantri, PaginatedResponse, CalonSantriApiResponse, SingleCalonSantriApiResponse, CheckStudentNikResponse } from '@/types/calonSantri'; // Import new types

// New interface for the payment request
export interface ProcessRegistrationPaymentRequest {
  registration_id: number;
  product_id: number;
  hijri_year: number;
  amount: number;
  transaction_type_id: number;
  channel: string;
  registration_number: string;
}

export const calonSantriApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getCalonSantri: builder.query<CalonSantriApiResponse, void>({ // Change return type to CalonSantriApiResponse
      query: () => 'main/registration',
      providesTags: ['CalonSantri'],
    }),
    getCalonSantriById: builder.query<SingleCalonSantriApiResponse, number>({
      query: (id) => `main/registration/${id}`,
      providesTags: (result, error, id) => [{ type: 'CalonSantri', id }],
    }),
    registerSantri: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: 'main/registration',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['CalonSantri'],
    }),
    updateCalonSantri: builder.mutation<any, { id: number; formData: FormData }>({
      query: ({ id, formData }) => {
        formData.append('_method', 'PUT');
        return {
          url: `main/registration/${id}`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'CalonSantri', id }, 'CalonSantri'],
    }),
    // New mutation for processing registration payment
    processRegistrationPayment: builder.mutation<any, ProcessRegistrationPaymentRequest>({
      query: (paymentData) => ({
        url: 'main/registration/transaction',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['CalonSantri'], // Invalidate to refetch santri details
    }),
    checkStudentByNik: builder.query<CheckStudentNikResponse, string>({
      query: (nik) => `main/registration/student/${nik}/check`,
    }),
  }),
  overrideExisting: true,
});

export const { useGetCalonSantriQuery, useRegisterSantriMutation, useGetCalonSantriByIdQuery, useProcessRegistrationPaymentMutation, useUpdateCalonSantriMutation, useLazyCheckStudentByNikQuery } = calonSantriApi;