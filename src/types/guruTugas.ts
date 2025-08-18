// Type for the data returned by the GET /internship endpoint (for the list view)
export interface InternshipListItem {
  id: number;
  student: {
    id: number;
    nis: string;
    nama: string;
  };
  academic_year: {
    id: number;
    name: string;
  };
  city: {
    id: number;
    name: string;
  };
  supervisor: {
    id: number;
    name: string;
  };
  partner: {
    id: number;
    name: string;
  };
  start_date: string;
  end_date: string;
  status: string;
}

// Type for the data sent in the POST /internship request
export interface InternshipPayload {
  student_id: string;
  partner_id: string;
  academic_year_id: string;
  city_id: string;
  supervisor_id: string;
  start_date: string; // "YYYY-MM-DD"
  end_date: string; // "YYYY-MM-DD"
  status: string;
  // The form also has alamat_institusi, which is not in the payload.
  // It's assumed to be part of the partner entity.
}

// The old type, now replaced by InternshipListItem
export interface GuruTugas {
  id: string;
  nis: string;
  nama: string;
  periode: string;
  wilayahTugas: string;
  penanggungJawab: string;
}