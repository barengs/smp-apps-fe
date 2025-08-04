export interface CalonSantri {
  id: number;
  registration_number: string; // Changed from nomor_pendaftaran
  registration_date: string | null;
  status: 'pending' | 'diterima' | 'ditolak';
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
  previous_school: string | null; // Changed from asal_sekolah
  previous_school_address: string | null;
  certificate_number: string | null;
  education_level_id: number | null;
  created_at: string; // Changed from tanggal_daftar
  updated_at: string;
  parent: any; // Anda bisa mendefinisikan antarmuka Parent jika diperlukan
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
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