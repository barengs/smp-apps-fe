import { smpApi } from '../baseApi';

export type SanctionType = 'peringatan' | 'skorsing' | 'pembinaan' | 'denda' | 'lainnya';

export interface Sanction {
  id: number;
  name: string;
  description: string;
  type: SanctionType;
  duration_days: number;
  is_active: boolean;
}

export interface CreateUpdateSanctionRequest {
  name: string;
  description: string;
  type: SanctionType;
  duration_days: number;
  is_active: boolean;
}

interface ListResponse {
  success: boolean;
  message: string;
  data: Array<
    Omit<Sanction, 'duration_days'> & {
      duration_days: number | string;
    }
  >;
}

interface SingleResponse {
  success: boolean;
  message: string;
  data: Omit<Sanction, 'duration_days'> & {
    duration_days: number | string;
  };
}

export const sanctionApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getSanctions: builder.query<Sanction[], void>({
      query: () => 'master/sanction',
      transformResponse: (response: ListResponse) =>
        response.data.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          type: item.type as SanctionType,
          duration_days:
            typeof item.duration_days === 'string' ? Number(item.duration_days) : item.duration_days,
          is_active: item.is_active,
        })),
      providesTags: ['Sanction'],
    }),
    createSanction: builder.mutation<Sanction, CreateUpdateSanctionRequest>({
      query: (payload) => ({
        url: 'master/sanction',
        method: 'POST',
        body: payload,
      }),
      transformResponse: (response: SingleResponse) => ({
        id: response.data.id,
        name: response.data.name,
        description: response.data.description,
        type: response.data.type as SanctionType,
        duration_days:
          typeof response.data.duration_days === 'string'
            ? Number(response.data.duration_days)
            : response.data.duration_days,
        is_active: response.data.is_active,
      }),
      invalidatesTags: ['Sanction'],
    }),
    updateSanction: builder.mutation<Sanction, { id: number; data: CreateUpdateSanctionRequest }>({
      query: ({ id, data }) => ({
        url: `master/sanction/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: SingleResponse) => ({
        id: response.data.id,
        name: response.data.name,
        description: response.data.description,
        type: response.data.type as SanctionType,
        duration_days:
          typeof response.data.duration_days === 'string'
            ? Number(response.data.duration_days)
            : response.data.duration_days,
        is_active: response.data.is_active,
      }),
      invalidatesTags: ['Sanction'],
    }),
    deleteSanction: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/sanction/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sanction'],
    }),
  }),
});

export const {
  useGetSanctionsQuery,
  useCreateSanctionMutation,
  useUpdateSanctionMutation,
  useDeleteSanctionMutation,
} = sanctionApi;