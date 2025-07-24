import { smpApi } from '../baseApi';

interface EducationGroupApiData {
  code: string; // Mengganti 'id' dengan 'code'
  name: string;
  // 'description' dihapus
}

interface GetEducationGroupsResponse {
  message: string;
  data: EducationGroupApiData[];
}

export interface CreateUpdateEducationGroupRequest {
  code: string; // Menambahkan 'code'
  name: string;
  // 'description' dihapus
}

export const educationGroupApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getEducationGroups: builder.query<GetEducationGroupsResponse, void>({
      query: () => 'master/education-class', // Mengubah endpoint
      providesTags: ['EducationGroup'],
    }),
    createEducationGroup: builder.mutation<EducationGroupApiData, CreateUpdateEducationGroupRequest>({
      query: (newEducationGroup) => ({
        url: 'master/education-class', // Mengubah endpoint
        method: 'POST',
        body: newEducationGroup,
      }),
      invalidatesTags: ['EducationGroup'],
    }),
    updateEducationGroup: builder.mutation<EducationGroupApiData, { code: string; data: CreateUpdateEducationGroupRequest }>({
      query: ({ code, data }) => ({
        url: `master/education-class/${code}`, // Mengubah endpoint dan parameter
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['EducationGroup'],
    }),
    deleteEducationGroup: builder.mutation<void, string>({ // Mengubah tipe parameter
      query: (code) => ({
        url: `master/education-class/${code}`, // Mengubah endpoint dan parameter
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