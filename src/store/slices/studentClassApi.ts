import { smpApi } from '../baseApi';

// Interface untuk response API
interface StudentClassResponse {
  status: number;
  data: StudentClassData[];
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
}

// Interface untuk request body
interface CreateStudentClassRequest {
  academic_year_id: number;
  education_id: number;
  student_id: number;
  class_id: number;
  approval_status?: string;
  approval_note?: string;
}

interface UpdateStudentClassRequest {
  academic_year_id?: number;
  education_id?: number;
  student_id?: number;
  class_id?: number;
  approval_status?: string;
  approval_note?: string;
  approved_by?: number;
}

export const studentClassApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentClasses: builder.query<StudentClassData[], void>({
      query: () => 'main/student-class',
      transformResponse: (response: StudentClassResponse) => {
        console.log('StudentClass API Response:', response);
        return response.data;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Student' as const, id })),
              { type: 'Student', id: 'LIST' },
            ]
          : [{ type: 'Student', id: 'LIST' }],
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
    getStudentClassesByStatus: builder.query<StudentClassData[], string>({
      query: (status) => `main/student-class?approval_status=${status}`,
      transformResponse: (response: StudentClassResponse) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Student' as const, id })),
              { type: 'Student', id: 'LIST' },
            ]
          : [{ type: 'Student', id: 'LIST' }],
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