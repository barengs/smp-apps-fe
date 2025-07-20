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
interface ParentDetailData {
  id: number;
  first_name: string;
  last_name: string | null;
  parent_as?: string;
}

interface StudentDetailData {
  id: number;
  first_name: string;
  last_name: string | null;
  nis: string;
  nik: string;
  period: string;
  gender: 'L' | 'P';
  status: string;
  program: ProgramApiData;
  parents: ParentDetailData[]; // Added parents array
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
  }),
});

export const { useGetStudentsQuery, useGetStudentByIdQuery } = studentApi;