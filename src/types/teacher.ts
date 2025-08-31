export interface Province {
  code: string;
  name: string;
}

export interface City {
  code: string;
  name: string;
  province_code: string;
  province?: Province;
}

export interface District {
  code: string;
  name: string;
  city_code: string;
  city?: City;
}

export interface Village {
  code: string;
  name: string;
  district_code: string;
  district?: District;
}

export interface Staff {
  id: string;
  user_id: string;
  code: string;
  first_name: string;
  last_name: string;
  nik: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  zip_code: string | null;
  photo: string | null;
  status: 'Aktif' | 'Tidak Aktif' | 'Cuti';
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  // Properti yang ditambahkan untuk memperbaiki error
  nip: string | null;
  gender: 'male' | 'female';
  phone_number: string | null;
  birth_place: string;
  birth_date: string;
  religion: string;
  marital_status: string;
  job_id: number;
  village: Village | null;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  pivot: {
    model_type: string;
    model_id: string;
    role_id: string;
  };
}

export interface UserWithStaffAndRoles {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  staff: Staff;
  roles: Role[];
}

// Diperbarui agar sesuai dengan respons API yang lebih datar
export interface TeacherApiResponse {
  data: UserWithStaffAndRoles[]; // Langsung array guru
  message: string;
  status?: number; // Menambahkan properti status jika ada di respons
}

export interface SingleTeacherApiResponse {
  data: UserWithStaffAndRoles;
  message: string;
}