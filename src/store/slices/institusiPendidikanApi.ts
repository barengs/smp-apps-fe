import { smpApi } from '../baseApi';
import { InstitusiPendidikan, JenjangPendidikan } from '@/types/pendidikan';
import { Staff } from '@/types/teacher';
import { PaginationParams } from '@/types/master-data'; // Hanya import PaginationParams

interface InstitusiPendidikanApiResponse extends Omit<InstitusiPendidikan, 'education_id' | 'education' | 'education_class' | 'headmaster'> {
  education_id: string; // API returns string
  education: JenjangPendidikan;
  education_class: { id: number; code: string; name: string };
  headmaster: Staff;
}

interface GetInstitusiPendidikanRawResponse {
  success: boolean;
  message: string;
  data: InstitusiPendidikanApiResponse[]; // API returns array directly
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
    getInstitusiPendidikan: builder.query<InstitusiPendidikanApiResponse[], PaginationParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
        return `main/educational-institution?${queryParams.toString()}`;
      },
      transformResponse: (response: GetInstitusiPendidikanRawResponse) => response.data,
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'InstitusiPendidikan' as const, id })),
              { type: 'InstitusiPendidikan', id: 'LIST' },
            ]
          : [{ type: 'InstitusiPendidikan', id: 'LIST' }],
    }),
    createInstitusiPendidikan: builder.mutation<InstitusiPendidikan, CreateUpdateInstitusiPendidikanRequest>({
      query: (body) => ({
        url: 'main/educational-institution',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'InstitusiPendidikan', id: 'LIST' }],
    }),
    updateInstitusiPendidikan: builder.mutation<InstitusiPendidikan, { id: number; data: CreateUpdateInstitusiPendidikanRequest }>({
      query: ({ id, data }) => ({
        url: `main/educational-institution/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'InstitusiPendidikan', id }, { type: 'InstitusiPendidikan', id: 'LIST' }],
    }),
    deleteInstitusiPendidikan: builder.mutation<{ message: string }, number>({
        query: (id) => ({
            url: `main/educational-institution/${id}`,
            method: 'DELETE',
        }),
        invalidatesTags: [{ type: 'InstitusiPendidikan', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetInstitusiPendidikanQuery,
  useCreateInstitusiPendidikanMutation,
  useUpdateInstitusiPendidikanMutation,
  useDeleteInstitusiPendidikanMutation,
} = institusiPendidikanApi;