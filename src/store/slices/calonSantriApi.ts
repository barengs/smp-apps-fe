import { smpApi } from '../baseApi';
import { CalonSantri, PaginatedResponse, CalonSantriApiResponse, SingleCalonSantriApiResponse } from '@/types/calonSantri'; // Import new types

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
      query: () => 'registration',
      providesTags: ['CalonSantri'],
    }),
    getCalonSantriById: builder.query<SingleCalonSantriApiResponse, number>({
      query: (id) => `registration/${id}`,
      providesTags: (result, error, id) => [{ type: 'CalonSantri', id }],
    }),
    registerSantri: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: 'registration',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['CalonSantri'],
    }),
    // New mutation for processing registration payment
    processRegistrationPayment: builder.mutation<any, ProcessRegistrationPaymentRequest>({
      query: (paymentData) => ({
        url: 'registration/transaction',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['CalonSantri'], // Invalidate to refetch santri details
    }),
  }),
  overrideExisting: true,
});

export const { useGetCalonSantriQuery, useRegisterSantriMutation, useGetCalonSantriByIdQuery, useProcessRegistrationPaymentMutation } = calonSantriApi;