import React, { useRef } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import CustomBreadcrumb, { BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { BookCopy, Printer, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useGetStudentReportCardQuery } from '@/store/slices/reportCardApi';
import { useReactToPrint } from 'react-to-print';
import { Skeleton } from '@/components/ui/skeleton';

const RaportPrintView: React.FC = () => {
    const { classGroupId, studentId } = useParams();
    const [searchParams] = useSearchParams();
    const semester = searchParams.get('semester') || '1';
    const academicYearId = searchParams.get('academic_year_id');
    const navigate = useNavigate();

    const componentRef = useRef<HTMLDivElement>(null);

    const { data: reportRes, isLoading } = useGetStudentReportCardQuery({
        classGroupId: Number(classGroupId),
        studentId: Number(studentId),
        semester,
        academic_year_id: academicYearId || undefined
    }, { skip: !classGroupId || !studentId });

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Raport_${reportRes?.data?.student?.first_name}_${reportRes?.data?.student?.last_name}`,
    });

    const breadcrumbItems: BreadcrumbItemData[] = [
        { label: 'Kurikulum', href: '/dashboard/manajemen-kurikulum/raport', icon: <BookCopy className="h-4 w-4" /> },
        { label: 'Cetak Raport', icon: <Printer className="h-4 w-4" /> },
    ];

    if (isLoading) {
        return (
            <DashboardLayout title="Mencetak Raport" role="administrasi">
                <div className="container mx-auto py-4 px-4 space-y-4">
                    <Skeleton className="h-10 w-[200px]" />
                    <Card><CardContent className="h-[600px] flex items-center justify-center">Memuat Data Raport...</CardContent></Card>
                </div>
            </DashboardLayout>
        );
    }

    const { student, class_group, academic_year, assessments } = reportRes?.data || {};
    const advisorName = class_group?.advisor?.first_name ? `${class_group?.advisor?.first_name} ${class_group?.advisor?.last_name || ''}` : 'Belum Ditentukan';

    // Safety check
    if (!student) {
        return (
            <DashboardLayout title="Raport Tidak Ditemukan" role="administrasi">
                <div className="container p-4">Data tidak ditemukan.</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Pratinjau Raport" role="administrasi">
            <div className="container mx-auto py-4 px-4 space-y-6">
                <CustomBreadcrumb items={breadcrumbItems} />
                <div className="flex gap-4 justify-between items-center mb-6">
                    <Button variant="outline" onClick={() => navigate('/dashboard/manajemen-kurikulum/raport')}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
                    </Button>
                    <Button onClick={handlePrint} className="flex gap-2">
                        <Printer className="h-4 w-4" /> Cetak / Simpan PDF
                    </Button>
                </div>

                {/* AREA YANG AKAN DICETAK */}
                <Card>
                    <CardContent className="p-0 flex justify-center bg-gray-100 dark:bg-zinc-900 border-none">
                        <div
                            ref={componentRef}
                            className="bg-white text-black p-10 w-full max-w-[210mm] mx-auto min-h-[297mm] shadow-lg print:shadow-none print:m-0 print:w-[210mm]"
                            style={{
                                fontFamily: "'Times New Roman', Times, serif",
                            }}
                        >
                            {/* KOP RAPORT DAPAT DISESUAIKAN */}
                            <div className="text-center mb-6 border-b-4 border-black pb-4">
                                <h1 className="text-2xl font-bold uppercase">Laporan Hasil Belajar (Raport)</h1>
                                <h2 className="text-xl font-bold">Kementerian Pendidikandan Kebudayaan</h2>
                                <p className="text-sm">Menunjukkan Capaian Kompetensi Peserta Didik</p>
                            </div>

                            {/* BIODATA SISWA & KELAS */}
                            <table className="w-full text-sm font-semibold mb-6">
                                <tbody>
                                    <tr>
                                        <td className="w-[100px] py-1">Nama Siswa</td>
                                        <td className="w-[10px]">:</td>
                                        <td>{student.first_name} {student.last_name}</td>
                                        <td className="w-[120px]">Kelas / Rombel</td>
                                        <td className="w-[10px]">:</td>
                                        <td>{class_group.classroom?.name} ({class_group.name})</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">NISN / NIS</td>
                                        <td>:</td>
                                        <td>{student.nisn || '-'} / {student.nipd || '-'}</td>
                                        <td>Fase / Semester</td>
                                        <td>:</td>
                                        <td>- / {semester === '1' ? 'Ganjil' : 'Genap'}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">Sekolah</td>
                                        <td>:</td>
                                        <td>{class_group.educational_institution?.name || 'SMP / MTS'}</td>
                                        <td>Tahun Ajaran</td>
                                        <td>:</td>
                                        <td>{academic_year?.year || '-'}</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* TABEL NILAI MAPEL */}
                            <div className="mb-6">
                                <h3 className="font-bold text-[15px] mb-2">A. Penilaian Akademik</h3>
                                <table className="w-full border-collapse border border-black text-sm">
                                    <thead>
                                        <tr className="bg-gray-200 print:bg-gray-200">
                                            <th className="border border-black px-2 py-2 w-10 text-center">No</th>
                                            <th className="border border-black px-2 py-2">Mata Pelajaran</th>
                                            <th className="border border-black px-2 py-2 w-20 text-center">KKM/Pengetahuan</th>
                                            <th className="border border-black px-2 py-2 w-20 text-center">Keterampilan</th>
                                            <th className="border border-black px-2 py-2 w-20 text-center">Nilai Akhir</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assessments?.length > 0 ? assessments.map((assessment: any, idx: number) => {
                                            const mapelName = assessment.class_schedule_detail?.study?.name || '-';
                                            return (
                                                <tr key={assessment.id}>
                                                    <td className="border border-black px-2 py-1 text-center">{idx + 1}</td>
                                                    <td className="border border-black px-2 py-1">{mapelName}</td>
                                                    <td className="border border-black px-2 py-1 text-center font-semibold">{Number(assessment.final_knowledge_score || 0).toFixed(0)}</td>
                                                    <td className="border border-black px-2 py-1 text-center font-semibold">{Number(assessment.final_skill_score || 0).toFixed(0)}</td>
                                                    <td className="border border-black px-2 py-1 text-center font-bold">{Number(assessment.final_score || 0).toFixed(0)}</td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan={5} className="border border-black px-2 py-4 text-center text-gray-500">
                                                    Belum ada data nilai yang tersimpan untuk semester ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* CATATAN WALI KELAS DLL */}
                            <div className="flex justify-between items-start mb-16 text-sm">
                                <div className="border border-black p-4 w-[60%]">
                                    <h4 className="font-bold mb-2">Sikap Spiritual dan Sosial</h4>
                                    <p>Predikat: Baik</p>
                                    <p className="mt-2 text-xs">Catatan Wali Kelas: Tingkatkan lagi belajarnya dan pertahankan kedisiplinannya.</p>
                                </div>
                                <div className="border border-black p-4 w-[35%]">
                                    <h4 className="font-bold mb-2">Ketidakhadiran</h4>
                                    <table className="w-full">
                                        <tbody>
                                            <tr><td>Sakit</td><td>: - Hari</td></tr>
                                            <tr><td>Izin</td><td>: - Hari</td></tr>
                                            <tr><td>Tanpa Ket.</td><td>: - Hari</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* TTD */}
                            <div className="flex justify-between mt-10 text-sm">
                                <div className="text-center w-1/3">
                                    <p className="mb-16">Mengetahui,<br />Orang Tua / Wali</p>
                                    <p className="font-bold underline uppercase pt-8">......................................</p>
                                </div>
                                <div className="text-center w-1/3">
                                    <p className="mb-16">Wali Kelas,</p>
                                    <p className="font-bold underline uppercase pt-8">{advisorName}</p>
                                    {/* Bisa ditambahkan NIP jika ada */}
                                    <p className="text-xs">NIP. -</p>
                                </div>
                            </div>

                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default RaportPrintView;
