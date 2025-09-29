import { smpApi } from '../baseApi';
import { InstitusiPendidikan, JenjangPendidikan } from '@/types/pendidikan';

// The API response for a single institution, assuming 'education' is nested
interface InstitusiPendidikanApiResponse extends Omit<InstitusiPendidikan, 'education_id' | 'education'> {
  education_id: number;
  education: JenjangPendidikan;
}

// The API response for GET all institutions
interface GetInstitusiPendidikanApiResponse {
  message: string;
  data: InstitusiPendidikanApiResponse[];
}

// The request body for creating or updating an institution
export interface CreateUpdateInstitusiPendidikanRequest {
  institution_name: string;
  education_id: number;
  registration_number: string;
  institution_status: string;
  institution_address?: string;
  institution_description?: string;
}

export const institusiPendidikanApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getInstitusiPendidikan: builder.query<InstitusiPendidikanApiResponse[], void>({
      query: () => 'main/educational-institution', // New endpoint
      transformResponse: (response: GetInstitusiPendidikanApiResponse) => response.data,
      providesTags: ['InstitusiPendidikan'],
    }),
    createInstitusiPendidikan: builder.mutation<InstitusiPendidikan, CreateUpdateInstitusiPendidikanRequest>({
      query: (body) => ({
        url: 'main/educational-institution', // New endpoint
        method: 'POST',
        body,
      }),
      invalidatesTags: ['InstitusiPendidikan'],
    }),
    updateInstitusiPendidikan: builder.mutation<InstitusiPendidikan, { id: number; data: CreateUpdateInstitusiPendidikanRequest }>({
      query: ({ id, data }) => ({
        url: `main/educational-institution/${id}`, // New endpoint
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'InstitusiPendidikan', id }, 'InstitusiPendidikan'],
    }),
    deleteInstitusiPendidikan: builder.mutation<{ message: string }, number>({
        query: (id) => ({
            url: `main/educational-institution/${id}`, // New endpoint
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