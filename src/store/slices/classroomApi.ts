import { smpApi } from '../baseApi';

// --- API Response and Request Types ---

// Structure for a single classroom object from the API
interface ClassroomApiData {
  id: number;
  name: string;
  description: string;
}

// The GET response is a direct array
type GetClassroomsResponse = ClassroomApiData[];

// Structure for the POST/PUT request body
export interface CreateUpdateClassroomRequest {
  name: string;
  description?: string;
}

export const classroomApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getClassrooms: builder.query<GetClassroomsResponse, void>({
      query: () => 'master/classroom',
      providesTags: ['Classroom'],
    }),
    createClassroom: builder.mutation<ClassroomApiData, CreateUpdateClassroomRequest>({
      query: (newClassroom) => ({
        url: 'master/classroom',
        method: 'POST',
        body: newClassroom,
      }),
      invalidatesTags: ['Classroom'],
    }),
    updateClassroom: builder.mutation<ClassroomApiData, { id: number; data: CreateUpdateClassroomRequest }>({
      query: ({ id, data }) => ({
        url: `master/classroom/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Classroom'],
    }),
    deleteClassroom: builder.mutation<void, number>({
      query: (id) => ({
        url: `master/classroom/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Classroom'],
    }),
  }),
});

export const {
  useGetClassroomsQuery,
  useCreateClassroomMutation,
  useUpdateClassroomMutation,
  useDeleteClassroomMutation,
} = classroomApi;