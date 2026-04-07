import { smpApi } from '../baseApi';
import { PaginationParams } from '@/types/master-data';

export interface Student {
  id: number;
  first_name: string;
  last_name?: string | null;
  nis: string;
  nik: string;
  period: string;
  gender: string;
  status: string;
  program?: { name: string };
  hostel?: { name: string };
  created_at: string;
  updated_at: string;
  // Opsional untuk halaman detail (sesuai struktur baru)
  photo?: string | null;
  born_in?: string | null;
  born_at?: string | null;
  phone?: string | null;
  address?: string | null;
  parents?: any;
  parent_id?: string;
  kk?: string;
  last_education?: string;
  village_id?: number;
  village?: string;
  district?: string;
  postal_code?: string;
  hostel_id?: number;
  program_id?: number;
  user_id?: number;
  deleted_at?: string;

  current_room?: {
    room_name?: string;
  } | null;
  agreement?: StudentAgreement | null;
}

export interface StudentAgreement {
  id: number;
  student_id: number;
  doc_number: string;
  contract_level: string | null;
  contract_agreed: boolean;
  contract_agreed_at: string | null;
  compliance_agreed: boolean;
  compliance_agreed_at: string | null;
  urine_test_agreed: boolean;
  urine_test_agreed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GetStudentAgreementResponse {
  success: boolean;
  data: StudentAgreement;
  student: Student;
}

export interface UpdateAgreementStepRequest {
  step: 'contract' | 'compliance' | 'urine_test';
  agreed: boolean;
  contract_level?: string;
}

export interface StudentAgreementResponse {
  success: boolean;
  data: {
    data: (Student & { agreement: StudentAgreement | null })[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface CreateUpdateStudentRequest {
  parent_id?: string;
  nis: string;
  period: string;
  nik: string;
  kk?: string;
  first_name: string;
  last_name?: string | null;
  gender: string;
  address?: string | null;
  born_in?: string | null;
  born_at?: string | null;
  last_education?: string | null;
  village_id?: number | null;
  village?: string | null;
  district?: string | null;
  postal_code?: string | null;
  phone?: string | null;
  hostel_id?: number | null;
  program_id?: number | null;
  status: string;
  photo?: string | null;
  user_id?: number | null;
  deleted_at?: string | null;
}

export interface AssignStudentRoomRequest {
  room_id: number;
  academic_year_id: number;
  start_date: string;
  notes?: string;
}

export interface BulkAssignStudentRoomRequest {
  student_ids: number[];
  room_id: number;
  academic_year_id: number;
  start_date: string;
  notes?: string;
}

export interface RoomHistoryItem {
  id: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  notes: string | null;
  room_id: number;
  room_name: string;
  hostel_id: number;
  hostel_name: string;
  academic_year_id: number | null;
  academic_year: string | null;
}

export interface RoomHistoryResponse {
  success: boolean;
  message: string;
  data: RoomHistoryItem[];
}

interface GetStudentsResponse {
  data: Student[];
}

export const studentApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudents: builder.query<Student[], PaginationParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params.sort_order) queryParams.append('sort_order', params.sort_order);
        return `main/student?${queryParams.toString()}`;
      },
      // Normalisasi berbagai bentuk respons: { data: Student[] } atau { data: { data: Student[] } }
      transformResponse: (response: any): Student[] => {
        if (Array.isArray(response?.data)) {
          return response.data as Student[];
        }
        if (Array.isArray(response?.data?.data)) {
          return response.data.data as Student[];
        }
        return [];
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
            ...result.map(({ id }) => ({ type: 'Student' as const, id })),
            { type: 'Student', id: 'LIST' },
          ]
          : [{ type: 'Student', id: 'LIST' }],
    }),
    getStudentById: builder.query<Student, number>({
      query: (id) => `main/student/${id}`,
      transformResponse: (response: { message: string; status: number; data: Student }) => response.data,
      providesTags: (result, error, id) => [{ type: 'Student', id }],
    }),
    createStudent: builder.mutation<Student, CreateUpdateStudentRequest>({
      query: (newStudent) => ({
        url: 'main/student',
        method: 'POST',
        body: newStudent,
      }),
      invalidatesTags: [{ type: 'Student', id: 'LIST' }],
    }),
    updateStudent: builder.mutation<Student, { id: number; data: CreateUpdateStudentRequest }>({
      query: ({ id, data }) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value === undefined || value === null) return;
          // Kirim angka sebagai string
          if (typeof value === 'number') {
            formData.append(key, String(value));
          } else {
            formData.append(key, value as string);
          }
        });
        // Laravel/Symfony lebih andal membaca field pada POST multipart,
        // jadi spoof method PUT agar validasi tidak kehilangan field.
        formData.append('_method', 'PUT');
        return {
          url: `main/student/${id}`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Student', id }, { type: 'Student', id: 'LIST' }],
    }),
    deleteStudent: builder.mutation<void, number>({
      query: (id) => ({
        url: `main/student/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Student', id: 'LIST' }],
    }),
    assignStudentRoom: builder.mutation<{ message?: string }, { id: number; data: AssignStudentRoomRequest }>({
      query: ({ id, data }) => ({
        url: `main/student/${id}/room/assign`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Student', id: 'LIST' },
        { type: 'Student', id },
        { type: 'Student', id: `HISTORY_${id}` },
      ],
    }),
    bulkAssignStudentRoom: builder.mutation<{ message?: string }, BulkAssignStudentRoomRequest>({
      query: (data) => ({
        url: 'main/student/room/bulk-assign',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { student_ids }) => [
        { type: 'Student', id: 'LIST' },
        ...student_ids.map(id => ({ type: 'Student' as const, id })),
        ...student_ids.map(id => ({ type: 'Student' as const, id: `HISTORY_${id}` })),
      ],
    }),
    // Riwayat asrama santri
    getStudentRoomHistory: builder.query<RoomHistoryResponse, number>({
      query: (id) => `main/student/${id}/room/history`,
      providesTags: (result, error, id) => [{ type: 'Student', id: `HISTORY_${id}` }],
    }),
    // NEW: upload/update student photo via multipart
    updateStudentPhoto: builder.mutation<Student, { id: number; photo: File }>({
      query: ({ id, photo }) => {
        const formData = new FormData();
        formData.append('photo', photo);
        return {
          url: `main/student/${id}/update-photo`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Student', id }],
    }),
    // NEW: Export data santri (XLSX)
    exportStudents: builder.mutation<Blob, void>({
      query: () => ({
        url: 'main/student/export',
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),
    // NEW: Backup data santri (CSV)
    backupStudents: builder.mutation<Blob, void>({
      query: () => ({
        url: 'main/student/backup',
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),
    getStudentAgreement: builder.query<GetStudentAgreementResponse, number>({
      query: (id) => `main/student/${id}/agreement`,
      providesTags: (result, error, id) => [{ type: 'Student', id: `AGREEMENT_${id}` }],
    }),
    updateStudentAgreementStep: builder.mutation<{ success: boolean; data: StudentAgreement }, { id: number; data: any }>({
      query: ({ id, data }) => ({
        url: `main/student/${id}/agreement`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Student'],
    }),
    listStudentAgreements: builder.query<StudentAgreementResponse, { page?: number; search?: string; per_page?: number }>({
      query: (params) => ({
        url: 'main/student/agreement/list',
        params,
      }),
      providesTags: ['Student'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetStudentsQuery,
  useGetStudentByIdQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useAssignStudentRoomMutation,
  useBulkAssignStudentRoomMutation,
  useGetStudentRoomHistoryQuery,
  useLazyGetStudentRoomHistoryQuery,
  // NEW: export hook
  useUpdateStudentPhotoMutation,
  useExportStudentsMutation,
  useBackupStudentsMutation,
  useGetStudentAgreementQuery,
  useUpdateStudentAgreementStepMutation,
  useListStudentAgreementsQuery,
} = studentApi;