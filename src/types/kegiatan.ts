export interface Kegiatan {
  id: number;
  date: Date;
  name: string;
  description?: string;
  status: 'Selesai' | 'Belum Selesai'; // Frontend status
}