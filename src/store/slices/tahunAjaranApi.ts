import { smpApi } from '../baseApi';
import { AcademicYear, AcademicQuarter } from '@/types/pendidikan';

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
  start_date: string;
  end_date: string;
  active: boolean;
  description?: string;
}

export interface AcademicQuarterRequest {
  academic_year_id: number;
  name: string;
  start_date: string;
  end_date: string;
  active: boolean;
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
    
    // Academic Quarters
    getAcademicQuarters: builder.query<{ status: string; message: string; data: AcademicQuarter[] }, { academic_year_id?: number }>({
      query: (params) => ({
        url: 'master/academic-quarter',
        params,
      }),
      providesTags: ['AcademicQuarter'],
    }),
    getActiveAcademicQuarter: builder.query<{ status: string; message: string; data: AcademicQuarter }, void>({
      query: () => 'master/academic-quarter/active',
      providesTags: ['AcademicQuarter'],
    }),
    createAcademicQuarter: builder.mutation<any, AcademicQuarterRequest>({
      query: (body) => ({
        url: 'master/academic-quarter',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AcademicQuarter', 'TahunAjaran'],
    }),
    updateAcademicQuarter: builder.mutation<any, { id: number; data: Partial<AcademicQuarterRequest> }>({
      query: ({ id, data }) => ({
        url: `master/academic-quarter/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['AcademicQuarter', 'TahunAjaran'],
    }),
    deleteAcademicQuarter: builder.mutation<any, number>({
      query: (id) => ({
        url: `master/academic-quarter/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AcademicQuarter', 'TahunAjaran'],
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
  // Quarters
  useGetAcademicQuartersQuery,
  useGetActiveAcademicQuarterQuery,
  useCreateAcademicQuarterMutation,
  useUpdateAcademicQuarterMutation,
  useDeleteAcademicQuarterMutation,
} = tahunAjaranApi;