import { smpApi } from '../baseApi';

export interface ViolationCategory {
  id: number;
  name: string;
  description: string;
  severity_level: number;
  is_active: boolean;
}

interface GetViolationCategoryResponse {
  success: boolean;
  message: string;
  data: (Omit<ViolationCategory, 'severity_level'> & { severity_level: string })[];
}

interface SingleViolationCategoryResponse {
  success: boolean;
  message: string;
  data: Omit<ViolationCategory, 'severity_level'> & { severity_level: string };
}

export interface CreateUpdateViolationCategoryRequest {
  name: string;
  description: string;
  severity_level: number;
  is_active: boolean;
}

export const violationCategoryApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getViolationCategories: builder.query<ViolationCategory[], void>({
      query: () => 'master/violation-category',
      transformResponse: (response: GetViolationCategoryResponse) =>
        response.data.map((item) => ({
          ...item,
          severity_level: Number(item.severity_level),
        })),
      providesTags: ['ViolationCategory'],
    }),
    createViolationCategory: builder.mutation<ViolationCategory, CreateUpdateViolationCategoryRequest>({
      query: (payload) => ({
        url: 'master/violation-category',
        method: 'POST',
        body: payload,
      }),
      transformResponse: (response: SingleViolationCategoryResponse) => ({
        ...response.data,
        severity_level: Number(response.data.severity_level),
      }),
      invalidatesTags: ['ViolationCategory'],
    }),
    updateViolationCategory: builder.mutation<ViolationCategory, { id: number; data: CreateUpdateViolationCategoryRequest }>({
      query: ({ id, data }) => ({
        url: `master/violation-category/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: SingleViolationCategoryResponse) => ({
        ...response.data,
        severity_level: Number(response.data.severity_level),
      }),
      invalidatesTags: ['ViolationCategory'],
    }),
    deleteViolationCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/violation-category/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ViolationCategory'],
    }),
  }),
});

export const {
  useGetViolationCategoriesQuery,
  useCreateViolationCategoryMutation,
  useUpdateViolationCategoryMutation,
  useDeleteViolationCategoryMutation,
} = violationCategoryApi;