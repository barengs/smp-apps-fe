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

export const studentApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudents: builder.query<GetStudentsResponse, void>({
      query: () => 'student',
      providesTags: ['Student'],
    }),
    // CRUD endpoints can be added here later
  }),
});

export const { useGetStudentsQuery } = studentApi;