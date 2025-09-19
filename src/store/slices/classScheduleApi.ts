import { smpApi } from '../baseApi';

// --- API Response and Request Types ---

// Struktur untuk satu detail dalam request
interface CreateClassScheduleDetailRequest {
  classroom_id: number;
  class_group_id: number;
  day: string;
  lesson_hour_id: number;
  teacher_id: number;
  study_id: number;
}

// Struktur untuk body request POST
export interface CreateClassScheduleRequest {
  academic_year_id: number;
  education_id: number;
  session: string;
  status: string;
  details: CreateClassScheduleDetailRequest[];
}

// --- Tipe respons untuk GET ---
interface SimpleObject {
    id: number;
    name: string;
}

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
    active: string;
    description: string | null;
}

interface Education {
    id: number;
    name: string;
    description: string;
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
}

// Struktur utama untuk satu item dalam array 'data' dari respons GET
export interface ClassScheduleData {
  id: number;
  academic_year_id: string;
  education_id: string;
  session: string;
  status: string;
  created_at: string;
  updated_at: string;
  academic_year: AcademicYear;
  education: Education;
  details: ClassScheduleDetail[];
}

// Respons GET lengkap
interface GetClassSchedulesResponse {
  message: string;
  status: number;
  data: ClassScheduleData[];
}

// Respons POST
interface CreateClassScheduleResponse {
    message: string;
    status: number;
    data: any; // Data jadwal yang dibuat
}


export const classScheduleApi = smpApi.injectEndpoints({
  endpoints: (builder) => ({
    getClassSchedules: builder.query<GetClassSchedulesResponse, void>({
      query: () => 'main/class-schedule',
      providesTags: ['ClassSchedule'],
    }),
    createClassSchedule: builder.mutation<CreateClassScheduleResponse, CreateClassScheduleRequest>({
      query: (newSchedule) => ({
        url: 'main/class-schedule',
        method: 'POST',
        body: newSchedule,
      }),
      invalidatesTags: ['ClassSchedule'],
    }),
  }),
});

export const {
  useGetClassSchedulesQuery,
  useCreateClassScheduleMutation,
} = classScheduleApi;