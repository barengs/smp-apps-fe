import { smpApi } from '../baseApi';

interface EducationGroupApiData {
  id: number;
  name: string;
  description: string;
}

interface GetEducationGroupsResponse {
  message: string;
  data: EducationGroupApiData[];
}

export interface CreateUpdateEducationGroupRequest {
  name: string;
  description: string;
}

export const educationGroupApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getEducationGroups: builder.query<GetEducationGroupsResponse, void>({
      query: () => 'master/education-group',
      providesTags: ['EducationGroup'],
    }),
    createEducationGroup: builder.mutation<EducationGroupApiData, CreateUpdateEducationGroupRequest>({
      query: (newEducationGroup) => ({
        url: 'master/education-group',
        method: 'POST',
        body: newEducationGroup,
      }),
      invalidatesTags: ['EducationGroup'],
    }),
    updateEducationGroup: builder.mutation<EducationGroupApiData, { id: number; data: CreateUpdateEducationGroupRequest }>({
      query: ({ id, data }) => ({
        url: `master/education-group/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['EducationGroup'],
    }),
    deleteEducationGroup: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/education-group/${id}`,
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