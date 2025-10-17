import { smpApi } from '../baseApi';
import { EducationLevel } from '@/types/master-data';
import { PaginatedResponse, PaginationParams } from '@/types/master-data'; // Import PaginatedResponse and PaginationParams

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
  level: number;
  description: string | null;
  education_class: NestedEducationClass[]; // Array of associated education classes
}

// Raw response structure from the API with 'data' wrapper
interface GetEducationLevelsRawResponse {
  message: string;
  data: PaginatedResponse<EducationLevelApiData>; // Wrap in PaginatedResponse
}

// Structure for the POST/PUT request body
export interface CreateUpdateEducationLevelRequest {
  name: string;
  level: number;
  description?: string;
  education_class_ids?: number[]; // Array of IDs for associated education classes
}

// New interface for the import response
export interface ImportEducationLevelResponse {
  message: string;
}

export const educationApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getEducationLevels: builder.query<PaginatedResponse<EducationLevelApiData>, PaginationParams>({ // Update return type and add params
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params.sort_order) queryParams.append('sort_order', params.sort_order);
        return 'master/education-level';
      },
      transformResponse: (response: GetEducationLevelsRawResponse) => response.data, // Extract the PaginatedResponse
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'EducationLevel' as const, id })),
              { type: 'EducationLevel', id: 'LIST' },
            ]
          : [{ type: 'EducationLevel', id: 'LIST' }],
    }),
    getEducationLevelById: builder.query<EducationLevelApiData, number>({
      query: (id) => `master/education-level/${id}`,
      providesTags: (result, error, id) => [{ type: 'EducationLevel', id }],
    }),
    createEducationLevel: builder.mutation<EducationLevelApiData, CreateUpdateEducationLevelRequest>({
      query: (newLevel) => ({
        url: 'master/education-level',
        method: 'POST',
        body: newLevel,
      }),
      invalidatesTags: [{ type: 'EducationLevel', id: 'LIST' }],
    }),
    updateEducationLevel: builder.mutation<EducationLevelApiData, { id: number; data: CreateUpdateEducationLevelRequest }>({
      query: ({ id, data }) => ({
        url: `master/education-level/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'EducationLevel', id }, { type: 'EducationLevel', id: 'LIST' }],
    }),
    deleteEducationLevel: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/education-level/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'EducationLevel', id: 'LIST' }],
    }),
    importEducationLevels: builder.mutation<ImportEducationLevelResponse, FormData>({
      query: (formData) => ({
        url: 'master/education-level/import',
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