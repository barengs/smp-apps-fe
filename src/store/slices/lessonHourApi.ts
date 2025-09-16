import { smpApi } from '../baseApi';
import { JamPelajaran } from '@/types/kurikulum';

// The API response for a list of lesson hours
interface LessonHoursResponse {
  success: boolean;
  message: string;
  data: JamPelajaran[];
}

// The data structure for creating/updating a lesson hour
type LessonHourPayload = Omit<JamPelajaran, 'id'>;

export const lessonHourApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getLessonHours: builder.query<JamPelajaran[], void>({
      query: () => 'master/lesson-hour',
      transformResponse: (response: LessonHoursResponse) => response.data,
      providesTags: ['LessonHour'],
    }),
    addLessonHour: builder.mutation<JamPelajaran, LessonHourPayload>({
      query: (body) => ({
        url: 'master/lesson-hour',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['LessonHour'],
    }),
    updateLessonHour: builder.mutation<JamPelajaran, JamPelajaran>({
      query: ({ id, ...body }) => ({
        url: `master/lesson-hour/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['LessonHour'],
    }),
    deleteLessonHour: builder.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({
        url: `master/lesson-hour/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LessonHour'],
    }),
  }),
});

export const {
  useGetLessonHoursQuery,
  useAddLessonHourMutation,
  useUpdateLessonHourMutation,
  useDeleteLessonHourMutation,
} = lessonHourApi;