export interface CalonSantri {
  id: number;
  nomor_pendaftaran: string;
  nama_lengkap: string;
  asal_sekolah: string;
  status: 'pending' | 'diterima' | 'ditolak';
  tanggal_daftar: string;
}