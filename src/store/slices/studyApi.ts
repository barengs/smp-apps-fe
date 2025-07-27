import { smpApi } from '../baseApi';
import { MataPelajaran } from '@/types/pendidikan';

export const studyApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudies: builder.query<MataPelajaran[], void>({
      query: () => 'master/study',
      providesTags: ['Study'],
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
      invalidatesTags: ['Study'],
    }),
    updateStudy: builder.mutation<MataPelajaran, Partial<MataPelajaran>>({
      query: ({ id, ...patch }) => ({
        url: `master/study/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Study', id }, 'Study'],
    }),
    deleteStudy: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `master/study/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Study'],
    }),
  }),
});

export const {
  useGetStudiesQuery,
  useGetStudyByIdQuery,
  useCreateStudyMutation,
  useUpdateStudyMutation,
  useDeleteStudyMutation,
} = studyApi;