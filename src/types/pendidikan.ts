import { Staff } from './teacher';

export interface AcademicYear {
  id: number;
  year: string;
  type?: string;
  periode?: string;
  start_date?: string;
  end_date?: string;
  active: boolean;
  description: string;
}

export interface MataPelajaran {
  id: string;
  name: string;
  description?: string | null;
}

export interface JenjangPendidikan {
  id: number;
  name: string;
  level: number;
}

export interface KelompokPendidikan {
  code: string; // Diubah dari id: number
  name: string;
  education_level_id: number;
}

export interface ProgramPendidikan {
  id: number;
  name:string;
  education_group_id: number;
}

export interface Kelas {
  id: number;
  name: string;
  program_id: number;
  level: number;
}

export interface Rombel {
  id: number;
  name: string;
  class_id: number;
  academic_year_id: number;
}

export interface InstitusiPendidikan {
  id: number;
  education_id: number;
  education_class_code: string; // Diubah dari education_class_id: number
  registration_number: string;
  institution_name: string;
  institution_address: string;
  institution_phone: string;
  institution_email: string;
  institution_website: string;
  institution_logo: string;
  institution_banner: string;
  institution_status: string;
  institution_description: string;
  headmaster_id: string; // Diubah dari number
  education?: JenjangPendidikan;
  education_class?: { code: string; name: string };
  headmaster?: Staff;
}