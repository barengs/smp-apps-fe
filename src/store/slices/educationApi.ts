import { smpApi } from '../baseApi';

// Nested type for education_class
export interface NestedEducationClass {
  id: number;
  code: string;
  name: string;
}

// API response structure for a single education level
export interface EducationLevelApiData {
  id: number;
  name: string;
  description: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  education: Array<{
    id: number;
    name: string;
    description: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    pivot: {
      education_class_id: string;
      education_id: string;
    };
  }>;
}

// Raw response structure from the API with array
interface GetEducationLevelsRawResponse {
  message: string;
  status: number;
  data: EducationLevelApiData[];
}

// Structure for the POST/PUT request body
export interface CreateUpdateEducationLevelRequest {
  name: string;
  description?: string;
  education_class_ids?: number[]; // Array of IDs for associated education classes
}

// New interface for the import response
export interface ImportEducationLevelResponse {
  message: string;
}

export const educationApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getEducationLevels: builder.query<EducationLevelApiData[], void>({
      query: () => 'master/education-class',
      transformResponse: (response: GetEducationLevelsRawResponse) => response.data,
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'EducationLevel' as const, id })),
              { type: 'EducationLevel', id: 'LIST' },
            ]
          : [{ type: 'EducationLevel', id: 'LIST' }],
    }),
    getEducationLevelById: builder.query<EducationLevelApiData, number>({
      query: (id) => `master/education-class/${id}`,
      providesTags: (result, error, id) => [{ type: 'EducationLevel', id }],
    }),
    createEducationLevel: builder.mutation<EducationLevelApiData, CreateUpdateEducationLevelRequest>({
      query: (newLevel) => ({
        url: 'master/education-class',
        method: 'POST',
        body: newLevel,
      }),
      invalidatesTags: [{ type: 'EducationLevel', id: 'LIST' }],
    }),
    updateEducationLevel: builder.mutation<EducationLevelApiData, { id: number; data: CreateUpdateEducationLevelRequest }>({
      query: ({ id, data }) => ({
        url: `master/education-class/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'EducationLevel', id }, { type: 'EducationLevel', id: 'LIST' }],
    }),
    deleteEducationLevel: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/education-class/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'EducationLevel', id: 'LIST' }],
    }),
    importEducationLevels: builder.mutation<ImportEducationLevelResponse, FormData>({
      query: (formData) => ({
        url: 'master/education-class/import',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'EducationLevel', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetEducationLevelsQuery,
  useGetEducationLevelByIdQuery,
  useCreateEducationLevelMutation,
  useUpdateEducationLevelMutation,
  useDeleteEducationLevelMutation,
  useImportEducationLevelsMutation,
} = educationApi;