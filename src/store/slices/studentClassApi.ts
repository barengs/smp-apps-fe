import { smpApi } from '../baseApi';

// Interface untuk response API dengan pagination
interface StudentClassPaginatedResponse {
  current_page: number;
  data: StudentClassData[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

// New interface for the wrapped response
interface WrappedStudentClassResponse {
  message: string;
  status: number;
  data: StudentClassPaginatedResponse;
}

interface StudentClassData {
  id: number;
  academic_year_id: number;
  education_id: number;
  student_id: number;
  class_id: number;
  approval_status: string;
  approval_note: string;
  approved_by: number;
  created_at: string;
  updated_at: string;
  // Tambahan properti dari backend response
  students?: any;
  academic_years?: any;
  classrooms?: any;
}

// Interface untuk request body
interface CreateStudentClassRequest {
  academic_year_id: number;
  education_id: number;
  student_id: number | number[]; // Support both single student and array
  class_id: number; // Keep as class_id (not classroom_id)
  approval_status?: string;
  approval_note?: string;
}

interface UpdateStudentClassRequest {
  academic_year_id?: number;
  education_id?: number;
  student_id?: number;
  class_id: number; // Keep as class_id (not classroom_id)
  approval_status?: string;
  approval_note?: string;
  approved_by?: number;
}

// Interface untuk query params
interface GetStudentClassesParams {
  page?: number;
  per_page?: number;
  approval_status?: string;
}

export const studentClassApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentClasses: builder.query<StudentClassPaginatedResponse, GetStudentClassesParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.page) queryParams.append('page', params.page.toString());
          if (params.per_page) queryParams.append('per_page', params.per_page.toString());
          if (params.approval_status) queryParams.append('approval_status', params.approval_status);
        }
        return `main/student-class?${queryParams.toString()}`;
      },
      transformResponse: (response: WrappedStudentClassResponse) => {
        console.log('StudentClass API Response:', response);
        return response.data; // Extract the nested data property
      },
      providesTags: (result) => {
        // Validasi data dengan aman
        if (result && result.data && Array.isArray(result.data)) {
          return [
            ...result.data.map(({ id }) => ({ type: 'Student' as const, id })),
            { type: 'Student', id: 'LIST' },
          ];
        }
        return [{ type: 'Student', id: 'LIST' }];
      },
    }),
    getStudentClassById: builder.query<StudentClassData, number>({
      query: (id) => `main/student-class/${id}`,
      providesTags: (result, error, id) => [{ type: 'Student', id }],
    }),
    createStudentClass: builder.mutation<StudentClassData, CreateStudentClassRequest>({
      query: (newStudentClass) => ({
        url: 'main/student-class',
        method: 'POST',
        body: newStudentClass,
      }),
      invalidatesTags: [{ type: 'Student', id: 'LIST' }],
    }),
    updateStudentClass: builder.mutation<StudentClassData, { id: number; data: UpdateStudentClassRequest }>({
      query: ({ id, data }) => ({
        url: `main/student-class/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Student', id }, { type: 'Student', id: 'LIST' }],
    }),
    deleteStudentClass: builder.mutation<void, number>({
      query: (id) => ({
        url: `main/student-class/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Student', id: 'LIST' }],
    }),
    // Endpoint untuk mendapatkan data berdasarkan status approval
    getStudentClassesByStatus: builder.query<StudentClassPaginatedResponse, string>({
      query: (status) => `main/student-class?approval_status=${status}`,
      transformResponse: (response: WrappedStudentClassResponse) => response.data,
      providesTags: (result) => {
        // Validasi data dengan aman
        if (result && result.data && Array.isArray(result.data)) {
          return [
            ...result.data.map(({ id }) => ({ type: 'Student' as const, id })),
            { type: 'Student', id: 'LIST' },
          ];
        }
        return [{ type: 'Student', id: 'LIST' }];
      },
    }),
  }),
});

export const {
  useGetStudentClassesQuery,
  useGetStudentClassByIdQuery,
  useCreateStudentClassMutation,
  useUpdateStudentClassMutation,
  useDeleteStudentClassMutation,
  useGetStudentClassesByStatusQuery,
} = studentClassApi;