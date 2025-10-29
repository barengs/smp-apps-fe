import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';

type PresenceData = Record<number, Record<number, string>>;

interface GeneratePresensiPdfParams {
  schedule: any;
  detail: any;
  students: Array<any>;
  presenceData: PresenceData;
  meetingCount: number;
}

export function generatePresensiPdf({
  schedule,
  detail,
  students,
  presenceData,
  meetingCount,
}: GeneratePresensiPdfParams) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  const title = 'Lembar Presensi';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, 40, 40);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  const teacherName = (`${detail?.teacher?.first_name || ''} ${detail?.teacher?.last_name || ''}`).trim() || '-';
  const jamPelajaran = `${detail?.lesson_hour?.start_time ? detail.lesson_hour.start_time.substring(0, 5) : ''} - ${detail?.lesson_hour?.end_time ? detail.lesson_hour.end_time.substring(0, 5) : ''}`;

  const infoLines = [
    `Tahun Ajaran: ${schedule?.academic_year?.year || '-'}`,
    `Sesi: ${schedule?.session || '-'}`,
    `Jenjang Pendidikan: ${schedule?.education?.institution_name || '-'}`,
    `Kelas: ${detail?.classroom?.name || '-'}`,
    `Rombel: ${detail?.class_group?.name || '-'}`,
    `Mata Pelajaran: ${detail?.study?.name || '-'}`,
    `Guru Pengampu: ${teacherName}`,
    `Jam Pelajaran: ${jamPelajaran}`,
  ];

  let y = 60;
  infoLines.forEach((line) => {
    doc.text(line, 40, y);
    y += 16;
  });

  const head: RowInput[] = [
    ['Nama Siswa', ...Array.from({ length: meetingCount }, (_, i) => `P ${i + 1}`)],
  ];

  const body: RowInput[] = students.map((student: any) => {
    const name = (`${student?.first_name || ''} ${student?.last_name || ''}`).trim();
    const row = [
      name,
      ...Array.from({ length: meetingCount }, (_, i) => {
        const meetingNumber = i + 1;
        return presenceData?.[student?.id]?.[meetingNumber] || '-';
      }),
    ];
    return row;
  });

  autoTable(doc, {
    head,
    body,
    startY: y + 10,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [240, 240, 240] },
    columnStyles: { 0: { cellWidth: 180 } },
    didDrawPage(data) {
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`Halaman ${data.pageNumber} dari ${pageCount}`, doc.internal.pageSize.getWidth() - 120, doc.internal.pageSize.getHeight() - 20);
    },
  });

  const clean = (v: string | undefined) => (v || '').toString().trim().replace(/\s+/g, '-');
  const fileName = `Presensi_${clean(detail?.study?.name) || 'MataPelajaran'}_${clean(detail?.class_group?.name) || clean(detail?.classroom?.name) || 'Kelas'}.pdf`;

  // RETURN: blob URL & fileName untuk preview; tidak langsung menyimpan
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  const dataUrl = doc.output('dataurlstring');

  return { blobUrl, dataUrl, fileName };
}