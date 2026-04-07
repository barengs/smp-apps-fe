export interface RegistrationFile {
  id: number;
  registration_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  created_at: string;
  updated_at: string;
}

export interface Parent {
  id: number;
  nik: string;
  kk: string;
  first_name: string;
  last_name: string;
  gender: 'L' | 'P';
  phone: string;
  email: string | null;
  occupation_id: number | null;
  education_id: number | null;
  occupation?: { id: number; name: string } | null;
  education?: { id: number; name: string } | null;
  card_address: string;
  domicile_address: string | null;
  parent_as: 'ayah' | 'ibu' | 'wali';
  created_at: string;
  updated_at: string;
}

export interface CalonSantri {
  id: number;
  registration_number: string;
  registration_date: string | null;
  status: 'pending' | 'verified' | 'rejected' | 'accepted' | 'draft';
  parent_id: string;
  nis: string;
  period: string | null;
  nik: string;
  kk: string;
  first_name: string;
  last_name: string;
  gender: string;
  address: string;
  born_in: string;
  born_at: string;
  village_id: number | null;
  postal_code: string | null;
  phone: string | null;
  photo: string | null;
  photo_url: string | null; // New field from controller
  previous_school: string | null;
  previous_school_address: string | null;
  certificate_number: string | null;
  education_level_id: number | null;
  previous_madrasah: string | null; // Missing property
  previous_madrasah_address: string | null; // Missing property
  certificate_madrasah: string | null; // Missing property (mapped to madrasah_nomor_ijazah in controller but certificate_madrasah in migration)
  madrasah_level_id: number | null; // Missing property
  nisn: string;
  program_id: number | null;
  program: {
    id: number;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
  parent: Parent | null;
  payment_status: string;
  payment_amount: number | string | null;
  files: RegistrationFile[]; // Added files property
  village?: { id: number; code: string; name: string } | null;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
  message?: string;
  status?: number;
}

// New interface for the full API response structure
export interface CalonSantriApiResponse {
  message: string;
  status: number;
  data: PaginatedResponse<CalonSantri>;
}

// New interface for single CalonSantri API response
export interface SingleCalonSantriApiResponse {
  message: string;
  status: number;
  data: CalonSantri;
}

// New interface: response untuk cek nik santri
export interface CheckStudentNikVillage {
  id: string;
  code: string;
  name: string;
  district_name: string;
  city_name: string;
  province_name: string;
}

export interface CheckStudentNikResponse {
  success: boolean;
  jenis_kelamin: string;
  tanggal_lahir: string;
  kode_kota: string;
  tempat_lahir: string;
  nik: string;
  desa: CheckStudentNikVillage[];
}