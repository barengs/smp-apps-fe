import { smpApi } from '../baseApi';

// API response structure for a single program
interface ProgramApiData {
  id: number;
  name: string;
  // other properties if any
}

// API response structure for a single student
interface StudentApiData {
  id: number;
  first_name: string;
  last_name: string;
  nis: string;
  nik: string;
  period: string;
  gender: string;
  status: string;
  program: ProgramApiData;
  // other properties
}

// API response for the GET /student endpoint
interface GetStudentsResponse {
  message: string;
  data: StudentApiData[];
}

// --- Types for Single Student Detail ---

// Structure for a parent object within the student detail response
export interface ParentDetailData { // Added export
  user_id: number; // Changed from 'id' to 'user_id' based on provided JSON
  first_name: string;
  last_name: string | null;
  parent_as?: string;
  kk?: string;
  nik?: string;
  parent_id?: string | null;
  gender?: string;
  card_address?: string;
  domicile_address?: string | null;
  village_id?: number | null;
  phone?: string | null;
  email?: string | null;
  occupation?: string | null;
  education?: string | null;
  photo?: string | null;
  photo_path?: string | null;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface StudentDetailData { // Added export
  id: number;
  first_name: string;
  last_name: string | null;
  nis: string;
  nik: string;
  period: string;
  gender: 'L' | 'P';
  status: string;
  program: ProgramApiData;
  parents: ParentDetailData | ParentDetailData[]; // Adjusted to handle single object or array
  born_in?: string;
  born_at?: string;
  address?: string;
  phone?: string;
  photo?: string;
  created_at: string;
  updated_at: string;
}

interface GetStudentByIdResponse {
  message: string;
  data: StudentDetailData;
}

// --- Request Types for Create/Update Student ---
export interface CreateUpdateStudentRequest {
  first_name: string;
  last_name?: string | null;
  nis: string;
  nik?: string | null;
  period: string;
  gender: 'L' | 'P';
  status: string;
  program_id: number;
  born_in?: string | null;
  born_at?: string | null; // Date string (e.g., YYYY-MM-DD)
  address?: string | null;
  phone?: string | null;
  photo?: string | null; // URL for photo
  parent_id: number; // Added parent_id for linking
}

export const studentApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudents: builder.query<GetStudentsResponse, void>({
      query: () => 'student',
      providesTags: ['Student'],
    }),
    getStudentById: builder.query<GetStudentByIdResponse, number>({
      query: (id) => `student/${id}`,
      providesTags: (result, error, id) => [{ type: 'Student', id }],
    }),
    createStudent: builder.mutation<StudentApiData, CreateUpdateStudentRequest>({
      query: (newStudent) => ({
        url: 'student',
        method: 'POST',
        body: newStudent,
      }),
      invalidatesTags: ['Student'],
    }),
    updateStudent: builder.mutation<StudentApiData, { id: number; data: CreateUpdateStudentRequest }>({
      query: ({ id, data }) => ({
        url: `student/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Student'],
    }),
    deleteStudent: builder.mutation<void, number>({
      query: (id) => ({
        url: `student/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Student'],
    }),
  }),
});

export const { useGetStudentsQuery, useGetStudentByIdQuery, useCreateStudentMutation, useUpdateStudentMutation, useDeleteStudentMutation } = studentApi;