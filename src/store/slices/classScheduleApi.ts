import { smpApi } from '../baseApi';
import { InstitusiPendidikan } from '@/types/pendidikan';
import { PaginatedResponse, PaginationParams } from '@/types/master-data'; // Import PaginatedResponse and PaginationParams

// --- New Types for Presence ---
interface Presence {
  id: number;
  meeting_schedule_id: string;
  student_id: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alfa';
  description: string | null;
}

interface MeetingSchedule {
  id: number;
  class_schedule_detail_id: string;
  meeting_sequence: string;
  meeting_date: string;
  topic: string;
  presences: Presence[];
}

// --- API Response and Request Types ---

// Struktur untuk satu detail dalam request
interface CreateClassScheduleDetailRequest {
  classroom_id: number;
  class_group_id: number;
  day: string;
  lesson_hour_id: number;
  teacher_id: number;
  study_id: number;
  meeting_count: number; // Tambahkan properti meeting_count
}

// Struktur untuk body request POST
export interface CreateClassScheduleRequest {
  academic_year_id: number;
  educational_institution_id: number;
  session: string;
  status: string;
  details: CreateClassScheduleDetailRequest[];
}

// --- Tipe respons untuk GET ---
interface Teacher {
    id: number;
    first_name: string;
    last_name: string;
    gender: string;
    nik: string | null;
    nip: string | null;
    email: string;
    phone: string | null;
    address: string | null;
    village_id: string | null;
    zip_code: string | null;
    photo: string | null;
    marital_status: string;
    job_id: string | null;
    status: string;
}

interface LessonHour {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    order: string;
    description: string;
}

interface Classroom {
    id: number;
    name: string;
    parent_id: string | null;
    description: string | null;
}

interface ClassGroup {
    id: number;
    name: string;
    classroom_id: string;
}

interface Study {
    id: number;
    name: string;
    description: string;
}

interface AcademicYear {
    id: number;
    year: string;
    active: boolean;
    description: string | null;
}

// Struktur untuk satu item dalam array 'details'
interface ClassScheduleDetail {
  id: number;
  class_schedule_id: string;
  classroom_id: string;
  class_group_id: string;
  day: string;
  lesson_hour_id: string;
  teacher_id: string;
  study_id: string;
  created_at: string;
  updated_at: string;
  classroom: Classroom;
  class_group: ClassGroup;
  lesson_hour: LessonHour;
  teacher: Teacher;
  study: Study;
  students?: Array<{
    id: number;
    first_name: string;
    last_name: string;
  }>;
  meeting_count?: number;
  meeting_schedules?: MeetingSchedule[];
}

// Struktur utama untuk satu item dalam array 'data' dari respons GET
export interface ClassScheduleData {
  id: number;
  academic_year_id: string;
  educational_institution_id: string;
  session: string;
  status: string;
  created_at: string;
  updated_at: string;
  academic_year: AcademicYear;
  education: InstitusiPendidikan;
  details: ClassScheduleDetail[];
}

// Respons GET lengkap
interface GetClassSchedulesRawResponse {
  message: string;
  status: number;
  data: PaginatedResponse<ClassScheduleData>; // Wrap in PaginatedResponse
}

// Respons POST
interface CreateClassScheduleResponse {
    message: string;
    status: number;
    data: any; // Data jadwal yang dibuat
}

// Respons untuk endpoint presensi baru
interface GetPresenceResponse {
  success: boolean;
  message: string;
  data: ClassScheduleData;
}

// --- Tipe untuk menyimpan presensi ---
interface AttendanceRecord {
  student_id: number;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alfa';
}

export interface SaveAttendanceRequest {
  schedule_detail_id: number;
  meeting_number: number;
  attendances: AttendanceRecord[];
}

interface SaveAttendanceResponse {
  message: string;
  status: number;
  data: any;
}

// --- Tipe untuk memperbarui presensi ---
// Ganti definisi request agar mengirim list objek presensi satu-per-satu
export interface UpdatePresenceItem {
  student_id: number;
  meeting_schedule_id: number;
  status: 'hadir' | 'sakit' | 'izin' | 'alpha';
  description?: string | null;
}

export interface UpdatePresenceRequest {
  presences: UpdatePresenceItem[];
}

interface UpdatePresenceResponse {
  message: string;
  status: number;
  data: any;
}


export const classScheduleApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getClassSchedules: builder.query<PaginatedResponse<ClassScheduleData>, PaginationParams>({ // Update return type and add params
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params.sort_order) queryParams.append('sort_order', params.sort_order);
        return `main/class-schedule?${queryParams.toString()}`;
      },
      transformResponse: (response: GetClassSchedulesRawResponse) => response.data, // Extract the PaginatedResponse
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'ClassSchedule' as const, id })),
              { type: 'ClassSchedule', id: 'LIST' },
            ]
          : [{ type: 'ClassSchedule', id: 'LIST' }],
    }),
    getPresenceByScheduleId: builder.query<GetPresenceResponse, number>({
      query: (classScheduleId) => `main/presence?class_schedule_id=${classScheduleId}`,
      providesTags: (result, error, id) => [{ type: 'Presence', id: id }, { type: 'ClassSchedule', id: id }],
    }),
    createClassSchedule: builder.mutation<CreateClassScheduleResponse, CreateClassScheduleRequest>({
      query: (newSchedule) => ({
        url: 'main/class-schedule',
        method: 'POST',
        body: newSchedule,
      }),
      invalidatesTags: [{ type: 'ClassSchedule', id: 'LIST' }],
    }),
    saveAttendance: builder.mutation<SaveAttendanceResponse, SaveAttendanceRequest>({
      query: (attendanceData) => ({
        url: 'main/attendance',
        method: 'POST',
        body: attendanceData,
      }),
      invalidatesTags: ['Attendance', 'ClassSchedule', 'Presence'],
    }),
    updatePresence: builder.mutation<UpdatePresenceResponse, UpdatePresenceRequest>({
      query: (presenceList) => ({
        url: 'main/presence',
        method: 'POST',
        body: presenceList,
      }),
      invalidatesTags: ['Presence', 'ClassSchedule', 'Attendance'],
    }),
  }),
});

export const {
  useGetClassSchedulesQuery,
  useGetPresenceByScheduleIdQuery,
  useCreateClassScheduleMutation,
  useSaveAttendanceMutation,
  useUpdatePresenceMutation,
} = classScheduleApi;