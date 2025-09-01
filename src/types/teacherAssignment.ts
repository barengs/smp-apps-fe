export interface Staff {
  id: string; // Menggunakan user_id dari API sebagai ID staf
  first_name: string;
  last_name: string;
  nip: string | null; // Menggunakan nik dari API sebagai NIP
  email: string;
}

export interface Study {
  id: number;
  name: string;
  description: string | null;
}

// Ini adalah interface untuk objek staf yang dikembalikan langsung oleh API
export interface StaffDetailFromApi {
  id: number; // ID internal staf di database
  user_id: string; // ID pengguna yang terkait dengan staf
  code: string;
  first_name: string;
  last_name: string;
  nik: string | null; // Nomor Induk Karyawan
  email: string;
  phone: string | null;
  address: string | null;
  zip_code: string | null;
  photo: string | null;
  status: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  studies: Study[]; // Array mata pelajaran yang diajarkan staf ini
  user: {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
  };
}

// Ini adalah interface untuk setiap baris dalam DataTable, merepresentasikan satu penugasan staf-mata pelajaran
export interface TeacherAssignmentRow {
  staff: Staff;
  study: Study;
}

export interface TeacherAssignmentApiResponse {
  data: StaffDetailFromApi[];
  message: string;
  status: number;
}