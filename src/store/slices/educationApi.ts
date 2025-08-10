import { smpApi } from '../baseApi';

// --- API Response and Request Types ---

export interface NestedEducationClass { // Export interface ini agar bisa diimpor
  code: string;
  name: string;
}

interface EducationApiData {
  id: number;
  name: string;
  description: string;
  education_class: NestedEducationClass[]; // Mengubah menjadi array
}

interface GetEducationLevelsResponse {
  message: string;
  data: EducationApiData[];
}

export interface CreateUpdateEducationLevelRequest {
  name: string;
  description?: string;
  education_class_codes?: string[];
}

// New interface for the import response
export interface ImportEducationLevelResponse {
  message: string;
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
    importEducationLevels: builder.mutation<ImportEducationLevelResponse, FormData>({
      query: (formData) => ({
        url: 'master/education/import',
        method: 'POST',
        body: formData,
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
  useImportEducationLevelsMutation,
} = educationApi;