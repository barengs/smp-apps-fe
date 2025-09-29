import { smpApi } from '../baseApi';
import { InstitusiPendidikan, JenjangPendidikan } from '@/types/pendidikan';

// Assuming the API returns the education_level object nested
interface InstitusiPendidikanApiResponse extends Omit<InstitusiPendidikan, 'education_level_id' | 'education_level'> {
  education_level: JenjangPendidikan;
}

interface GetInstitusiPendidikanApiResponse {
  message: string;
  data: InstitusiPendidikanApiResponse[];
}

export interface CreateUpdateInstitusiPendidikanRequest {
  name: string;
  education_level_id: number;
  category: string;
  number_of_classes: number;
}

export const institusiPendidikanApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getInstitusiPendidikan: builder.query<InstitusiPendidikanApiResponse[], void>({
      query: () => 'master/institution',
      transformResponse: (response: GetInstitusiPendidikanApiResponse) => response.data,
      providesTags: ['InstitusiPendidikan'],
    }),
    createInstitusiPendidikan: builder.mutation<InstitusiPendidikan, CreateUpdateInstitusiPendidikanRequest>({
      query: (body) => ({
        url: 'master/institution',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['InstitusiPendidikan'],
    }),
    updateInstitusiPendidikan: builder.mutation<InstitusiPendidikan, { id: number; data: CreateUpdateInstitusiPendidikanRequest }>({
      query: ({ id, data }) => ({
        url: `master/institution/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'InstitusiPendidikan', id }, 'InstitusiPendidikan'],
    }),
    deleteInstitusiPendidikan: builder.mutation<{ message: string }, number>({
        query: (id) => ({
            url: `master/institution/${id}`,
            method: 'DELETE',
        }),
        invalidatesTags: ['InstitusiPendidikan'],
    }),
  }),
});

export const {
  useGetInstitusiPendidikanQuery,
  useCreateInstitusiPendidikanMutation,
  useUpdateInstitusiPendidikanMutation,
  useDeleteInstitusiPendidikanMutation,
} = institusiPendidikanApi;