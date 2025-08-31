export interface Teacher {
  id: string;
  user_id: number;
  first_name: string;
  last_name: string;
  nik: string;
  nip: string;
  gender: 'male' | 'female';
  phone_number: string;
  email: string;
  birth_place: string;
  birth_date: string;
  address: string;
  village_code: string;
  religion: string;
  marital_status: string;
  job_id: number;
  status: 'active' | 'inactive' | 'on_leave';
  photo: string | null;
  created_at: string;
  updated_at: string;
  // Data opsional untuk tampilan
  job?: {
    id: number;
    name: string;
  };
  village?: {
    code: string;
    name: string;
    district: {
      code: string;
      name: string;
      city: {
        code: string;
        name: string;
        province: {
          code: string;
          name: string;
        };
      };
    };
  };
  user?: {
    id: number;
    email: string;
    roles: { id: number; name: string }[];
  };
}

export interface TeacherApiResponse {
  data: {
    data: Teacher[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
  message: string;
}

export interface SingleTeacherApiResponse {
  data: Teacher;
  message: string;
}