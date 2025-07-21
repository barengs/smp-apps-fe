import { smpApi } from '../baseApi';

// --- API Response and Request Types ---

// Menambahkan tipe untuk data class_groups yang bersarang
interface ClassGroupNested {
  id: number;
  name: string;
}

// Struktur untuk satu objek classroom dari API
interface ClassroomApiData {
  id: number;
  name: string;
  parent_id: number | null;
  description: string;
  class_groups: ClassGroupNested[]; // Menambahkan field ini
}

// Respons GET adalah objek dengan properti 'data'
interface GetClassroomsResponse {
  message: string;
  data: ClassroomApiData[];
}

// Struktur untuk body request POST/PUT
export interface CreateUpdateClassroomRequest {
  name:string;
  parent_id?: number | null;
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