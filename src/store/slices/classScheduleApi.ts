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

interface TeacherStaff {
    first_name: string;
    last_name: string;
}

interface Teacher {
    id: number;
    staff: TeacherStaff;
}

interface LessonHour {
    id: number;
    start_time: string;
    end_time: string;
}

// Struktur untuk satu item dalam array 'data' dari respons GET
export interface ClassScheduleData {
  id: number;
  day: string;
  education: SimpleObject;
  classroom: SimpleObject;
  class_group: SimpleObject;
  study: SimpleObject;
  teacher: Teacher;
  lesson_hour: LessonHour;
  session: string;
  status: string;
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