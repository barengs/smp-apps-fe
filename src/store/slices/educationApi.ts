import { smpApi } from '../baseApi';

// --- API Response and Request Types ---

interface NestedEducationClass {
  code: string;
  name: string;
}

interface EducationApiData {
  id: number;
  name: string;
  description: string;
  education_class: NestedEducationClass;
}

interface GetEducationLevelsResponse {
  message: string;
  data: EducationApiData[];
}

export interface CreateUpdateEducationLevelRequest {
  name: string;
  description?: string;
  // education_class_code would be sent here if needed for creation/update
}

export const educationApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getEducationLevels: builder.query<GetEducationLevelsResponse, void>({
      query: () => 'master/education',
      providesTags: ['EducationLevel'],
    }),
    createEducationLevel: builder.mutation<EducationApiData, CreateUpdateEducationLevelRequest>({
      query: (newEducationLevel) => ({
        url: 'master/education',
        method: 'POST',
        body: newEducationLevel,
      }),
      invalidatesTags: ['EducationLevel'],
    }),
    updateEducationLevel: builder.mutation<EducationApiData, { id: number; data: CreateUpdateEducationLevelRequest }>({
      query: ({ id, data }) => ({
        url: `master/education/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['EducationLevel'],
    }),
    deleteEducationLevel: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/education/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EducationLevel'],
    }),
  }),
});

export const {
  useGetEducationLevelsQuery,
  useCreateEducationLevelMutation,
  useUpdateEducationLevelMutation,
  useDeleteEducationLevelMutation,
} = educationApi;