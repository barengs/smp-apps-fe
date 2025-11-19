import { smpApi } from '../baseApi';

export interface Violation {
  id: number;
  category_id: number;
  name: string;
  description: string;
  point: number;
  is_active: boolean;
}

interface GetViolationApiResponse {
  success: boolean;
  message: string;
  data: Violation[] | (Omit<Violation, 'point'> & { point: string })[];
}

interface SingleViolationApiResponse {
  success: boolean;
  message: string;
  data: Violation | (Omit<Violation, 'point'> & { point: string });
}

export interface CreateUpdateViolationRequest {
  category_id: number;
  name: string;
  description: string;
  point: number;
  is_active: boolean;
}

export const violationApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getViolations: builder.query<Violation[], void>({
      query: () => 'master/violation',
      transformResponse: (response: GetViolationApiResponse) =>
        (response.data as any[]).map((item) => ({
          ...item,
          point: typeof item.point === 'string' ? Number(item.point) : item.point,
        })),
      providesTags: ['Violation'],
    }),
    createViolation: builder.mutation<Violation, CreateUpdateViolationRequest>({
      query: (payload) => ({
        url: 'master/violation',
        method: 'POST',
        body: payload,
      }),
      transformResponse: (response: SingleViolationApiResponse) => {
        const data: any = response.data;
        return { ...data, point: typeof data.point === 'string' ? Number(data.point) : data.point };
      },
      invalidatesTags: ['Violation'],
    }),
    updateViolation: builder.mutation<Violation, { id: number; data: CreateUpdateViolationRequest }>({
      query: ({ id, data }) => ({
        url: `master/violation/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: SingleViolationApiResponse) => {
        const data: any = response.data;
        return { ...data, point: typeof data.point === 'string' ? Number(data.point) : data.point };
      },
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