import { smpApi } from '../baseApi';

export interface Violation {
  id: number;
  name: string;
  code: string;
  description: string;
}

interface GetViolationApiResponse {
  data: {
    data: Violation[];
  };
}

interface SingleViolationApiResponse {
  data: Violation;
}

export interface CreateUpdateViolationRequest {
  name: string;
  code: string;
  description: string;
}

export const violationApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getViolations: builder.query<Violation[], void>({
      query: () => 'master/violation',
      transformResponse: (response: GetViolationApiResponse) => response.data.data,
      providesTags: ['Violation'],
    }),
    createViolation: builder.mutation<Violation, CreateUpdateViolationRequest>({
      query: (newViolation) => ({
        url: 'master/violation',
        method: 'POST',
        body: newViolation,
      }),
      transformResponse: (response: SingleViolationApiResponse) => response.data,
      invalidatesTags: ['Violation'],
    }),
    updateViolation: builder.mutation<Violation, { id: number; data: CreateUpdateViolationRequest }>({
      query: ({ id, data }) => ({
        url: `master/violation/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: SingleViolationApiResponse) => response.data,
      invalidatesTags: ['Violation'],
    }),
    deleteViolation: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/violation/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Violation'],
    }),
  }),
});

export const {
  useGetViolationsQuery,
  useCreateViolationMutation,
  useUpdateViolationMutation,
  useDeleteViolationMutation,
} = violationApi;