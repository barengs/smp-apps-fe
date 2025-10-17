import { smpApi } from '../baseApi';
import { MataPelajaran } from '@/types/pendidikan';
import { PaginatedResponse, PaginationParams } from '@/types/master-data'; // Import PaginatedResponse and PaginationParams

// New interface for the import response
export interface ImportStudyResponse {
  message: string;
}

export const studyApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudies: builder.query<PaginatedResponse<MataPelajaran>, PaginationParams>({ // Update return type and add params
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params.sort_order) queryParams.append('sort_order', params.sort_order);
        return `master/study?${queryParams.toString()}`;
      },
      transformResponse: (response: { data: PaginatedResponse<MataPelajaran> }) => response.data, // Adjust transformResponse
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Study' as const, id })),
              { type: 'Study', id: 'LIST' },
            ]
          : [{ type: 'Study', id: 'LIST' }],
    }),
    getStudyById: builder.query<MataPelajaran, string>({
      query: (id) => `master/study/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Study', id }],
    }),
    createStudy: builder.mutation<MataPelajaran, Partial<MataPelajaran>>({
      query: (body) => ({
        url: 'master/study',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Study', id: 'LIST' }], // Invalidate LIST
    }),
    updateStudy: builder.mutation<MataPelajaran, Partial<MataPelajaran>>({
      query: ({ id, ...patch }) => ({
        url: `master/study/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Study', id }, { type: 'Study', id: 'LIST' }], // Invalidate specific and LIST
    }),
    deleteStudy: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `master/study/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Study', id: 'LIST' }], // Invalidate LIST
    }),
    importStudies: builder.mutation<ImportStudyResponse, FormData>({
      query: (formData) => ({
        url: 'master/study/import',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Study', id: 'LIST' }], // Invalidate LIST
    }),
  }),
});

export const {
  useGetStudiesQuery,
  useGetStudyByIdQuery,
  useCreateStudyMutation,
  useUpdateStudyMutation,
  useDeleteStudyMutation,
  useImportStudiesMutation,
} = studyApi;