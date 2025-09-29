import { smpApi } from '../baseApi';
import { InstitusiPendidikan, JenjangPendidikan } from '@/types/pendidikan';
import { Staff } from '@/types/teacher';

interface InstitusiPendidikanApiResponse extends Omit<InstitusiPendidikan, 'education_id' | 'education' | 'education_class' | 'headmaster'> {
  education_id: number;
  education: JenjangPendidikan;
  education_class: { id: number; code: string; name: string };
  headmaster: Staff;
}

interface GetInstitusiPendidikanApiResponse {
  message: string;
  data: InstitusiPendidikanApiResponse[];
}

export interface CreateUpdateInstitusiPendidikanRequest {
  institution_name: string;
  education_id: number;
  education_class_id: number;
  headmaster_id: string;
  registration_number: string;
  institution_status: string;
  institution_address?: string;
  institution_description?: string;
}

export const institusiPendidikanApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getInstitusiPendidikan: builder.query<InstitusiPendidikanApiResponse[], void>({
      query: () => 'main/educational-institution',
      transformResponse: (response: GetInstitusiPendidikanApiResponse) => response.data,
      providesTags: ['InstitusiPendidikan'],
    }),
    createInstitusiPendidikan: builder.mutation<InstitusiPendidikan, CreateUpdateInstitusiPendidikanRequest>({
      query: (body) => ({
        url: 'main/educational-institution',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['InstitusiPendidikan'],
    }),
    updateInstitusiPendidikan: builder.mutation<InstitusiPendidikan, { id: number; data: CreateUpdateInstitusiPendidikanRequest }>({
      query: ({ id, data }) => ({
        url: `main/educational-institution/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'InstitusiPendidikan', id }, 'InstitusiPendidikan'],
    }),
    deleteInstitusiPendidikan: builder.mutation<{ message: string }, number>({
        query: (id) => ({
            url: `main/educational-institution/${id}`,
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