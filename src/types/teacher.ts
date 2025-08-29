export interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  education_level: string; // Contoh: SD, SMP, SMA, Perguruan Tinggi
  class_name: string; // Contoh: Kelas 7A, Kelas X IPA
  status: 'active' | 'inactive' | 'on_leave'; // Contoh: aktif, tidak aktif, cuti
  created_at: string;
  updated_at: string;
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