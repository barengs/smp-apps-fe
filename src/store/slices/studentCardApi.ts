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
  }),
});

export const { useGetStudentCardSettingsQuery, useUpdateStudentCardSettingsMutation } = studentCardApi;
