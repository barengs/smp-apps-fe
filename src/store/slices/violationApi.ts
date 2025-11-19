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
  data: Array<
    Omit<Violation, 'category_id' | 'point'> & {
      category_id: number | string;
      point: number | string;
      category?: unknown;
    }
  >;
}

interface SingleViolationApiResponse {
  success: boolean;
  message: string;
  data: Omit<Violation, 'category_id' | 'point'> & {
    category_id: number | string;
    point: number | string;
    category?: unknown;
  };
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
        response.data.map((item) => ({
          id: item.id,
          category_id: typeof item.category_id === 'string' ? Number(item.category_id) : item.category_id,
          name: item.name,
          description: item.description,
          point: typeof item.point === 'string' ? Number(item.point) : item.point,
          is_active: item.is_active,
        })),
      providesTags: ['Violation'],
    }),
    createViolation: builder.mutation<Violation, CreateUpdateViolationRequest>({
      query: (payload) => ({
        url: 'master/violation',
        method: 'POST',
        body: payload,
      }),
      transformResponse: (response: SingleViolationApiResponse) => ({
        id: response.data.id,
        category_id:
          typeof response.data.category_id === 'string'
            ? Number(response.data.category_id)
            : response.data.category_id,
        name: response.data.name,
        description: response.data.description,
        point: typeof response.data.point === 'string' ? Number(response.data.point) : response.data.point,
        is_active: response.data.is_active,
      }),
      invalidatesTags: ['Violation'],
    }),
    updateViolation: builder.mutation<Violation, { id: number; data: CreateUpdateViolationRequest }>({
      query: ({ id, data }) => ({
        url: `master/violation/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: SingleViolationApiResponse) => ({
        id: response.data.id,
        category_id:
          typeof response.data.category_id === 'string'
            ? Number(response.data.category_id)
            : response.data.category_id,
        name: response.data.name,
        description: response.data.description,
        point: typeof response.data.point === 'string' ? Number(response.data.point) : response.data.point,
        is_active: response.data.is_active,
      }),
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