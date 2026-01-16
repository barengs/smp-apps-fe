import { smpApi } from '../baseApi';

interface EducationGroupApiData {
  id: number;
  code: string;
  name: string;
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

interface GetEducationGroupsResponse {
  message: string;
  status: number;
  data: EducationGroupApiData[];
}

export interface CreateUpdateEducationGroupRequest {
  code: string;
  name: string;
}

export const educationGroupApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getEducationGroups: builder.query<EducationGroupApiData[], void>({
      query: () => 'master/education-class',
      transformResponse: (response: GetEducationGroupsResponse) => response.data,
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
    exportEducationGroups: builder.mutation<Blob, void>({
      query: () => ({
        url: 'master/education-class/export',
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),
    backupEducationGroups: builder.mutation<Blob, void>({
      query: () => ({
        url: 'master/education-class/backup',
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetEducationGroupsQuery,
  useCreateEducationGroupMutation,
  useUpdateEducationGroupMutation,
  useDeleteEducationGroupMutation,
  useExportEducationGroupsMutation,
  useBackupEducationGroupsMutation,
} = educationGroupApi;