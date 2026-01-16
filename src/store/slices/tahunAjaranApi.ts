import { smpApi } from '../baseApi';
import { AcademicYear } from '@/types/pendidikan';

// Define the API response structure if it's wrapped
interface GetAcademicYearsApiResponse {
  message: string;
  data: AcademicYear[];
}

interface GetActiveAcademicYearApiResponse {
  message: string;
  data: AcademicYear;
}

export interface CreateUpdateTahunAjaranRequest {
  year: string;
  type: string;
  periode: string;
  start_date: string;
  end_date: string;
  active: boolean;
  description?: string;
}

export const tahunAjaranApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getTahunAjaran: builder.query<AcademicYear[], void>({
      query: () => 'master/academic-year',
      transformResponse: (response: GetAcademicYearsApiResponse) => response.data, // Extract the data array
      providesTags: ['TahunAjaran'],
    }),
    getActiveTahunAjaran: builder.query<AcademicYear, void>({
      query: () => 'master/academic-year/active',
      transformResponse: (response: GetActiveAcademicYearApiResponse) => response.data,
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
    exportTahunAjaran: builder.mutation<Blob, void>({
      query: () => ({
        url: 'master/academic-year/export',
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),
    backupTahunAjaran: builder.mutation<Blob, void>({
      query: () => ({
        url: 'master/academic-year/backup',
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const { 
  useGetTahunAjaranQuery,
  useGetActiveTahunAjaranQuery,
  useCreateTahunAjaranMutation,
  useUpdateTahunAjaranMutation,
  useExportTahunAjaranMutation,
  useBackupTahunAjaranMutation,
} = tahunAjaranApi;