import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { BookCopy, TrendingUp, PlusCircle, FileText } from 'lucide-react';
import { useGetStudentClassesQuery, useUpdateStudentClassMutation } from '@/store/slices/studentClassApi';
import { useGetStudentsQuery } from '@/store/slices/studentApi';
import { useGetProgramsQuery } from '@/store/slices/programApi';
import { useGetEducationLevelsQuery } from '@/store/slices/educationApi';
import { useGetTahunAjaranQuery } from '@/store/slices/tahunAjaranApi';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import TambahKenaikanKelasForm from './TambahKenaikanKelasForm';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

// Tipe data untuk baris tabel kenaikan kelas
interface PromotionData {
  id: number;
  class_id: number;
  siswa: string;
  tahunAjaran: string;
  jenjangPendidikan: string;
  kelas: string;
  statusApproval: string;
  tanggalPembuatan: string;
}

const KenaikanKelasPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionData | null>(null);
  const [approvalNote, setApprovalNote] = useState('');

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Kurikulum', href: '/dashboard/manajemen-kurikulum/kenaikan-kelas', icon: <BookCopy className="h-4 w-4" /> },
    { label: 'Kenaikan Kelas', icon: <TrendingUp className="h-4 w-4" /> },
  ];

  // Mengambil data dari endpoint main/student-class dengan pagination
  const { data: studentClassesResponse, isLoading: isLoadingStudentClasses } = useGetStudentClassesQuery({
    page: 1,
    per_page: 50 // Ambil 50 data per halaman
  });
  
  // Mengambil data pendukung
  const { data: studentsResponse, isLoading: isLoadingStudents } = useGetStudentsQuery();
  const { data: programsResponse, isLoading: isLoadingPrograms } = useGetProgramsQuery();
  const { data: levelsResponse, isLoading: isLoadingLevels } = useGetEducationLevelsQuery();
  const { data: academicYearsResponse, isLoading: isLoadingAcademicYears } = useGetTahunAjaranQuery();
  const [updateStudentClass, { isLoading: isUpdatingStatus }] = useUpdateStudentClassMutation();

  const isLoading = isLoadingStudentClasses || isLoadingStudents || isLoadingPrograms || isLoadingLevels || isLoadingAcademicYears;

  // Memproses dan menggabungkan data dengan validasi yang lebih baik
  const promotionData = React.useMemo(() => {
    if (isLoading || !studentClassesResponse || !studentsResponse || !programsResponse || !levelsResponse || !academicYearsResponse) {
      return [];
    }

    // Validasi struktur response yang benar
    if (!studentClassesResponse.data || !Array.isArray(studentClassesResponse.data)) {
      return [];
    }

    if (!studentsResponse.data || !Array.isArray(studentsResponse.data)) {
      return [];
    }

    // Membuat peta untuk pencarian cepat
    const studentMap = new Map(studentsResponse.data.map((s: any) => [s.id, s]));
    const programMap = new Map(programsResponse.map((p: any) => [p.id, p]));
    const levelMap = new Map((levelsResponse as any).data.map((l: any) => [l.id, l]));
    const academicYearMap = new Map(academicYearsResponse.map((ay: any) => [ay.id, ay]));

    return studentClassesResponse.data.map((studentClass): PromotionData => {
      // Gunakan data yang sudah tersedia di response (jika ada)
      const student = studentClass.students || studentMap.get(studentClass.student_id);
      const academicYear = studentClass.academic_years || academicYearMap.get(studentClass.academic_year_id);
      const classroom = studentClass.classrooms; // Data classroom sudah tersedia di response
      const education = studentClass.educations; // Data education/jenjang pendidikan sudah tersedia di response
      
      // Untuk jenjang pendidikan, gunakan langsung dari properti educations.name
      const jenjangPendidikan = education ? education.name : 'Tidak diketahui';

      const result = {
        id: studentClass.id,
        class_id: studentClass.class_id,
        siswa: student ? `${student.first_name} ${student.last_name || ''}`.trim() : 'Tidak diketahui',
        tahunAjaran: academicYear ? (academicYear.year || academicYear.name) : 'Tidak diketahui',
        jenjangPendidikan: jenjangPendidikan,
        kelas: classroom ? classroom.name : 'Tidak diketahui',
        statusApproval: studentClass.approval_status,
        tanggalPembuatan: new Date(studentClass.created_at).toLocaleDateString('id-ID'),
      };
      
      return result;
    });
  }, [studentClassesResponse, studentsResponse, programsResponse, levelsResponse, academicYearsResponse, isLoading]);

  const handleOpenApprovalDialog = (data: PromotionData) => {
    setSelectedPromotion(data);
    setApprovalNote('');
    setIsApprovalDialogOpen(true);
  };

  const handleApprovalAction = async (action: 'approve' | 'reject') => {
    if (!selectedPromotion) return;

    const toastId = showLoading('Memperbarui status...');
    try {
      // Gunakan endpoint yang sesuai
      const endpoint = action === 'approve' 
        ? `main/student-class/${selectedPromotion.id}/approve`
        : `main/student-class/${selectedPromotion.id}/reject`;
      
      await updateStudentClass({
        id: selectedPromotion.id,
        data: {
          class_id: selectedPromotion.class_id,
          approval_status: action === 'approve' ? 'disetujui' : 'ditolak',
          approval_note: approvalNote,
        },
      }).unwrap();
      dismissToast(toastId);
      showSuccess(`Status berhasil diubah menjadi ${action === 'approve' ? 'Disetujui' : 'Ditolak'}.`);
    } catch (err) {
      dismissToast(toastId);
      showError('Gagal memperbarui status.');
      console.error(err);
    } finally {
      setIsApprovalDialogOpen(false);
      setSelectedPromotion(null);
      setApprovalNote('');
    }
  };

  // Kolom untuk DataTable
  const columns: ColumnDef<PromotionData>[] = [
    {
      accessorKey: 'tahunAjaran',
      header: 'Tahun Ajaran',
    },
    {
      accessorKey: 'jenjangPendidikan',
      header: 'Jenjang Pendidikan',
    },
    {
      accessorKey: 'kelas',
      header: 'Kelas',
    },
    {
      accessorKey: 'siswa',
      header: 'Siswa',
    },
    {
      accessorKey: 'statusApproval',
      header: 'Status Approval',
      cell: ({ row }) => {
        const status = (row.getValue('statusApproval') as string).toLowerCase();

        if (status === 'pending' || status === 'diajukan') {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenApprovalDialog(row.original)}
              className="h-8 text-yellow-800 border-yellow-300 hover:bg-yellow-100"
            >
              Diajukan
            </Button>
          );
        }

        const getStatusBadge = (status: string) => {
          switch (status) {
            case 'disetujui':
              return <Badge variant="success">Disetujui</Badge>;
            case 'ditolak':
              return <Badge variant="destructive">Ditolak</Badge>;
            default:
              return <Badge variant="secondary">{status}</Badge>;
          }
        };
        return getStatusBadge(status);
      },
    },
    {
      accessorKey: 'tanggalPembuatan',
      header: 'Tanggal Pembuatan',
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePromotion(data)}
              className="h-8"
            >
              <ArrowUpRight className="h-4 w-4 mr-1" />
              Naikkan
            </Button>
          </div>
        );
      },
    },
  ];

  // Fungsi untuk menangani kenaikan kelas
  const handlePromotion = (data: PromotionData) => {
    // Implementasi logika kenaikan kelas akan ditambahkan di sini
  };

  // Fungsi untuk menambah data kenaikan kelas
  const handleAddData = () => {
    setIsAddModalOpen(true);
  };

  // Fungsi untuk proses penugasan
  const handleAssignment = () => {
    // Implementasi logika penugasan akan ditambahkan di sini
  };

  return (
    <DashboardLayout title="Manajemen Kenaikan Kelas" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Kenaikan Kelas</CardTitle>
            <CardDescription>Daftar siswa untuk proses kenaikan kelas berdasarkan data kelas saat ini.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableLoadingSkeleton />
            ) : (
              <DataTable 
                columns={columns} 
                data={promotionData} 
                exportFileName="data-kenaikan-kelas" 
                exportTitle="Data Kenaikan Kelas"
                onAddData={handleAddData}
                onAssignment={handleAssignment}
              />
            )}
          </CardContent>
        </Card>
      </div>
      <TambahKenaikanKelasForm isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      <AlertDialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Aksi</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan mengubah status untuk siswa "{selectedPromotion?.siswa}". Apakah Anda yakin?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="approval_note" className="text-right">
                Catatan
              </Label>
              <Textarea
                id="approval_note"
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                className="col-span-3"
                placeholder="Masukkan catatan (opsional)"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedPromotion(null)}>Batal</AlertDialogCancel>
            <Button
              variant="danger"
              onClick={() => handleApprovalAction('reject')}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus ? 'Memproses...' : 'Tolak'}
            </Button>
            <Button
              variant="success"
              onClick={() => handleApprovalAction('approve')}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus ? 'Memproses...' : 'Setujui'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default KenaikanKelasPage;