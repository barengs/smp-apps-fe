import { smpApi } from '../baseApi';

export interface StudentCardSettings {
  id?: number | string;
  front_template: string | null;
  back_template: string | null;
  stamp: string | null;
  signature: string | null;
}

export interface StudentCardConfigurationResponse {
  data: StudentCardSettings;
}

export const studentCardApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentCardSettings: builder.query<StudentCardConfigurationResponse, void>({
      query: () => 'main/student-card/setting',
      providesTags: ['StudentCardSettings'],
    }),
    updateStudentCardSettings: builder.mutation<StudentCardConfigurationResponse, FormData>({
      query: (formData) => ({
        url: 'main/student-card/setting',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['StudentCardSettings'],
    }),
    getStudentCard: builder.query<{ status: string; data: any; message?: string }, string>({ // NIS as arg
      query: (nis) => `main/student/card/${nis}`,
      providesTags: ['StudentCard'],
    }),
    createStudentCard: builder.mutation<{ status: string; data: any }, number>({ // Student ID as arg
      query: (studentId) => ({
        url: 'main/student/card',
        method: 'POST',
        body: { student_id: studentId },
      }),
      invalidatesTags: ['StudentCard'],
    }),
    deactivateStudentCard: builder.mutation<{ status: string; message: string }, number>({ // Card ID as arg
      query: (cardId) => ({
        url: `main/student/card/${cardId}/deactivate`,
        method: 'PUT',
        body: { _method: 'PUT' },
      }),
      invalidatesTags: ['StudentCard'],
    }),
  }),
});

export const { 
  useGetStudentCardSettingsQuery, 
  useUpdateStudentCardSettingsMutation,
  useGetStudentCardQuery,
  useCreateStudentCardMutation,
  useDeactivateStudentCardMutation
} = studentCardApi;
