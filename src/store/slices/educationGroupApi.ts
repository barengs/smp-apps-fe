import { smpApi } from '../baseApi';

interface EducationGroupApiData {
  id: number;
  code: string;
  name: string;
}

interface GetEducationGroupsResponse {
  message: string;
  data: EducationGroupApiData[];
}

export interface CreateUpdateEducationGroupRequest {
  code: string;
  name: string;
}

export const educationGroupApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getEducationGroups: builder.query<GetEducationGroupsResponse, void>({
      query: () => 'master/education-class',
      providesTags: ['EducationGroup'],
    }),
    createEducationGroup: builder.mutation<EducationGroupApiData, CreateUpdateEducationGroupRequest>({
      query: (newEducationGroup) => ({
        url: 'master/education-class',
        method: 'POST',
        body: newEducationGroup,
      }),
      invalidatesTags: ['EducationGroup'],
    }),
    updateEducationGroup: builder.mutation<EducationGroupApiData, { code: string; data: CreateUpdateEducationGroupRequest }>({
      query: ({ code, data }) => ({
        url: `master/education-class/${code}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['EducationGroup'],
    }),
    deleteEducationGroup: builder.mutation<void, string>({
      query: (code) => ({
        url: `master/education-class/${code}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EducationGroup'],
    }),
  }),
});

export const {
  useGetEducationGroupsQuery,
  useCreateEducationGroupMutation,
  useUpdateEducationGroupMutation,
  useDeleteEducationGroupMutation,
} = educationGroupApi;