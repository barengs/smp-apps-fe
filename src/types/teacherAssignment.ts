export interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  nip: string | null;
  email: string;
}

export interface Study {
  id: number;
  name: string;
  description: string | null;
}

export interface TeacherAssignment {
  id: number;
  staff_id: string;
  study_id: number;
  created_at: string;
  updated_at: string;
  staff: Staff;
  study: Study;
}

export interface TeacherAssignmentApiResponse {
  data: TeacherAssignment[];
  message: string;
}

export interface SingleTeacherAssignmentApiResponse {
  data: TeacherAssignment;
  message: string;
}