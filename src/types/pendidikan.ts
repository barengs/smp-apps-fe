export interface AcademicYear {
  id: number;
  year: string;
  semester: string;
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
  id: number;
  name: string;
  education_level_id: number;
}

export interface ProgramPendidikan {
  id: number;
  name: string;
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