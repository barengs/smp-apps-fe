import * as XLSX from 'xlsx';
import type { Student } from '@/store/slices/studentApi';

export function exportToExcel<T extends Record<string, any>>(data: T[], fileName: string, sheetName: string) {
  if (!Array.isArray(data)) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || 'Sheet1');
  XLSX.writeFile(workbook, `${fileName || 'export'}.xlsx`);
}

export interface ExportRombelStudentsOptions {
  classGroupName: string;
  students: Student[];
  institutionName?: string;
  institutionAddress?: string;
  fileName?: string;
}

export function exportRombelStudentsToExcel({
  classGroupName,
  students,
  institutionName = 'PONDOK PESANTREN',
  institutionAddress,
  fileName,
}: ExportRombelStudentsOptions) {
  if (!Array.isArray(students)) return;

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const getStudentAddress = (student: Student): string => {
    if (student.address && student.address.trim()) {
      return student.address.trim();
    }
    const region = [student.village, student.district].filter(Boolean).join(', ');
    return region || '-';
  };

  const rows: any[][] = [];

  // 1. Kop Pesantren
  rows.push([institutionName.toUpperCase()]);
  if (institutionAddress) {
    rows.push([institutionAddress]);
  }
  rows.push(['DAFTAR SANTRI ROMBONGAN BELAJAR']);
  rows.push([`Rombel: ${classGroupName}`]);
  rows.push([]); // Baris kosong pemisah

  // 2. Metadata
  rows.push([`Nama Rombel: ${classGroupName}`, '', '', '', `Tanggal Export: ${currentDate}`]);
  rows.push([`Total: ${students.length} Santri`, '', '', '', '']);
  rows.push([]); // Baris kosong sebelum tabel

  // 3. Header Kolom Tabel
  rows.push(['No', 'NIS', 'Nama Lengkap', 'Jenis Kelamin', 'Alamat']);

  // 4. Data Baris Santri
  students.forEach((student, index) => {
    const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || '-';
    const genderText = student.gender === 'L' ? 'Laki-laki' : (student.gender === 'P' ? 'Perempuan' : '-');
    const addressText = getStudentAddress(student);

    rows.push([
      index + 1,
      student.nis || '-',
      fullName,
      genderText,
      addressText,
    ]);
  });

  // 5. Bagian Tanda Tangan (seperti pada PDF)
  rows.push([]);
  rows.push([]);
  rows.push(['', '', '', `Pamekasan, ${currentDate}`]);
  rows.push(['', '', '', 'Wali Kelas / Pengelola Rombel,']);
  rows.push([]);
  rows.push([]);
  rows.push([]);
  rows.push(['', '', '', '__________________________']);
  rows.push(['', '', '', 'NIP / NIY.']);

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  // Atur lebar kolom (character widths)
  worksheet['!cols'] = [
    { wch: 6 },   // No
    { wch: 18 },  // NIS
    { wch: 35 },  // Nama Lengkap
    { wch: 18 },  // Jenis Kelamin
    { wch: 50 },  // Alamat
  ];

  // Atur merge cells untuk header judul
  const merges: XLSX.Range[] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // Nama Institusi
  ];

  let titleRow = 1;
  if (institutionAddress) {
    merges.push({ s: { r: titleRow, c: 0 }, e: { r: titleRow, c: 4 } });
    titleRow++;
  }
  merges.push({ s: { r: titleRow, c: 0 }, e: { r: titleRow, c: 4 } }); // DAFTAR SANTRI ROMBONGAN BELAJAR
  titleRow++;
  merges.push({ s: { r: titleRow, c: 0 }, e: { r: titleRow, c: 4 } }); // Rombel: ...

  worksheet['!merges'] = merges;

  const workbook = XLSX.utils.book_new();
  const safeSheetName = classGroupName.replace(/[:\\/?*[\]]/g, '_').slice(0, 31) || 'Data Siswa';
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);

  const outFileName = fileName || `Daftar_Santri_Rombel_${classGroupName.replace(/\s+/g, '_')}`;
  XLSX.writeFile(workbook, `${outFileName}.xlsx`);
}