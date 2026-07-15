import { smpApi } from '../baseApi';

export interface SanctionType {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SanctionTypesResponse {
  success: boolean;
  message: string;
  data: SanctionType[];
}

interface SanctionTypeResponse {
  success: boolean;
  message: string;
  data: SanctionType;
}

export const sanctionTypeApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getSanctionTypes: builder.query<SanctionType[], void>({
      query: () => '/master/sanction-type',
      transformResponse: (response: SanctionTypesResponse) => response.data,
      providesTags: ['SanctionType'],
    }),
    createSanctionType: builder.mutation<SanctionType, Partial<SanctionType>>({
      query: (body) => ({
        url: '/master/sanction-type',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SanctionType'],
    }),
    updateSanctionType: builder.mutation<SanctionType, { id: number; data: Partial<SanctionType> }>({
      query: ({ id, data }) => ({
        url: `/master/sanction-type/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SanctionType'],
    }),
    deleteSanctionType: builder.mutation<void, number>({
      query: (id) => ({
        url: `/master/sanction-type/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SanctionType'],
    }),
  }),
});

export const {
  useGetSanctionTypesQuery,
  useCreateSanctionTypeMutation,
  useUpdateSanctionTypeMutation,
  useDeleteSanctionTypeMutation,
} = sanctionTypeApi;
