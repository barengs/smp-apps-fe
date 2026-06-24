import { smpApi } from '../baseApi';

export interface LessonSession {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  order: number;
  created_at?: string;
  updated_at?: string;
}

interface LessonSessionResponse {
  success: boolean;
  message: string;
  data: LessonSession[];
}

type LessonSessionPayload = Omit<LessonSession, 'id' | 'created_at' | 'updated_at'>;

export const lessonSessionApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getLessonSessions: builder.query<LessonSession[], void>({
      query: () => 'master/lesson-session',
      transformResponse: (response: LessonSessionResponse) => response.data,
      providesTags: ['LessonSession'],
    }),
    addLessonSession: builder.mutation<LessonSession, LessonSessionPayload>({
      query: (body) => ({
        url: 'master/lesson-session',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['LessonSession'],
    }),
    updateLessonSession: builder.mutation<LessonSession, LessonSession>({
      query: ({ id, ...body }) => ({
        url: `master/lesson-session/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['LessonSession'],
    }),
    deleteLessonSession: builder.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({
        url: `master/lesson-session/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LessonSession'],
    }),
  }),
});

export const {
  useGetLessonSessionsQuery,
  useAddLessonSessionMutation,
  useUpdateLessonSessionMutation,
  useDeleteLessonSessionMutation,
} = lessonSessionApi;
