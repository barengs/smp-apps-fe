import { smpApi } from '../baseApi';
import { PaginationParams } from '@/types/master-data';

export interface NestedEducationClass {
  id: number;
  code: string;
  name: string;
}

export interface EducationLevelApiData {
  id: number;
  name: string;
  level: number;
  description: string | null;
  education_class?: NestedEducationClass[];
}

interface GetEducationLevelsRawResponse {
  message?: string;
  status?: string | number;
  data: EducationLevelApiData[];
}

export const educationApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getEducationLevels: builder.query<EducationLevelApiData[], PaginationParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params?.search) queryParams.append('search', params.search);
        return 'master/education';
      },
      transformResponse: (response: GetEducationLevelsRawResponse) => response.data,
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'EducationLevel' as const, id })),
              { type: 'EducationLevel', id: 'LIST' },
            ]
          : [{ type: 'EducationLevel', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetEducationLevelsQuery,
} = educationApi;
