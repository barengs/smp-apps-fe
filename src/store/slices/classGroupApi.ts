import { smpApi } from '../baseApi';

// --- API Response and Request Types ---

interface NestedClassroomData {
  id: number;
  name: string;
}

interface ClassGroupApiData {
  id: number;
  name: string;
  classroom_id: number;
  classroom: NestedClassroomData;
}

interface GetClassGroupsResponse {
  message: string;
  data: ClassGroupApiData[];
}

// Tambahan tipe untuk Advisor
interface Advisor {
  id: number;
  first_name: string;
  last_name: string;
}

interface GetAdvisorsResponse {
  message: string;
  data: Advisor[];
}

export interface CreateUpdateClassGroupRequest {
  name: string;
  classroom_id: number;
  educational_institution_id: number; // ditambahkan agar diterima backend
  advisor_id?: number | null; // tambahkan advisor_id untuk payload
}

export const classGroupApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getClassGroups: builder.query<GetClassGroupsResponse, void>({
      query: () => 'master/class-group',
      providesTags: ['ClassGroup'],
    }),
    getClassGroupAdvisors: builder.query<GetAdvisorsResponse, void>({
      query: () => 'master/class-group/advisors',
    }),
    createClassGroup: builder.mutation<ClassGroupApiData, CreateUpdateClassGroupRequest>({
      query: (newClassGroup) => ({
        url: 'master/class-group',
        method: 'POST',
        body: newClassGroup,
      }),
      invalidatesTags: ['ClassGroup'],
    }),
    updateClassGroup: builder.mutation<ClassGroupApiData, { id: number; data: CreateUpdateClassGroupRequest }>({
      query: ({ id, data }) => ({
        url: `master/class-group/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['ClassGroup'],
    }),
    deleteClassGroup: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/class-group/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ClassGroup'],
    }),
  }),
});

export const {
  useGetClassGroupsQuery,
  useGetClassGroupAdvisorsQuery,
  useCreateClassGroupMutation,
  useUpdateClassGroupMutation,
  useDeleteClassGroupMutation,
} = classGroupApi;