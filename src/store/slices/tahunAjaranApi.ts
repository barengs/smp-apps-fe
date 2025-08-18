import { smpApi } from '../baseApi';
import { AcademicYear } from '@/types/pendidikan';

export interface CreateUpdateTahunAjaranRequest {
  year: string;
  semester: 'Ganjil' | 'Genap';
  active: boolean;
  description?: string;
}

export const tahunAjaranApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getTahunAjaran: builder.query<AcademicYear[], void>({
      query: () => 'master/academic-year',
      providesTags: ['TahunAjaran'],
    }),
    createTahunAjaran: builder.mutation<AcademicYear, CreateUpdateTahunAjaranRequest>({
      query: (body) => ({
        url: 'master/academic-year',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TahunAjaran'],
    }),
    updateTahunAjaran: builder.mutation<AcademicYear, { id: number; data: CreateUpdateTahunAjaranRequest }>({
      query: ({ id, data }) => ({
        url: `master/academic-year/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'TahunAjaran', id }, 'TahunAjaran'],
    }),
  }),
});

export const { 
  useGetTahunAjaranQuery,
  useCreateTahunAjaranMutation,
  useUpdateTahunAjaranMutation,
} = tahunAjaranApi;