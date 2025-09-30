import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { BookCopy, TrendingUp, PlusCircle, FileText } from 'lucide-react';
import { useGetStudentClassesQuery, useUpdateStudentClassMutation } from '@/store/slices/studentClassApi';
import { useGetStudentsQuery } from '@/store/slices/studentApi';
import { useGetTahunAjaranQuery } from '@/store/slices/tahunAjaranApi';
import { useGetClassroomsQuery } from '@/store/slices/classroomApi';
import { useGetInstitusiPendidikanQuery } from '@/store/slices/institusiPendidikanApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TambahKenaikanKelasForm from './TambahKenaikanKelasForm';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { useDeleteStudentClassMutation } from '@/store/slices/studentClassApi';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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

export default function KenaikanKelasPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionData | null>(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const navigate = useNavigate();

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Kurikulum', href: '/dashboard/manajemen-kurikulum/kenaikan-kelas', icon: <BookCopy className="h-4 w-4" /> },
    { label: 'Kenaikan Kelas', icon: <TrendingUp className="h-4 w-4" /> },
  ];

  // Mengambil data dari endpoint main/student-class dengan pagination
  const { data: studentClassesResponse, isLoading: isLoadingStudentClasses } = useGetStudentClassesQuery();
  const { data: studentsResponse, isLoading: isLoadingStudents } = useGetStudentsQuery();
  const { data: academicYears, isLoading: isLoadingAcademicYears } = useGetTahunAjaranQuery();
  const { data: institusiPendidikan, isLoading: isLoadingInstitusiPendidikan } = useGetInstitusiPendidikanQuery();
  const { data: classroomsResponse, isLoading: isLoadingClassrooms } = useGetClassroomsQuery();
  const [deleteStudentClass] = useDeleteStudentClassMutation();
  const [updateStudentClass] = useUpdateStudentClassMutation();

  const isLoading = isLoadingStudentClasses || isLoadingStudents || isLoadingAcademicYears || isLoadingInstitusiPendidikan || isLoadingClassrooms;

  // Memproses dan menggabungkan data dengan validasi yang lebih baik
  const promotionData = React.useMemo(() => {
    if (isLoading || !studentClassesResponse || !studentsResponse || !academicYears || !institusiPendidikan || !classroomsResponse) {
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
    const studentMap = new Map(studentsResponse?.data?.map((s: any) => [s.id, s]) || []);
    const academicYearMap = new Map(academicYears?.map((ay: any) => [ay.id, ay]) || []);
    const institusiPendidikanMap = new Map(institusiPendidikan?.map((ip: any) => [ip.id, ip]) || []);
    const classroomMap = new Map(classroomsResponse?.data?.map((c: any) => [c.id, c]) || []);

    return studentClassesResponse.data.map((studentClass): PromotionData => {
      // Gunakan data yang sudah tersedia di response (jika ada)
      const student = studentClass.students || studentMap.get(studentClass.student_id);
      const academicYear = studentClass.academic_years || academicYearMap.get(studentClass.academic_year_id);
      const classroom = studentClass.classrooms; // Data classroom sudah tersedia di response
      const education = studentClass.educations; // Data education/jenjang pendidikan sudah tersedia di response
      
      // Untuk jenjang pendidikan, gunakan langsung dari properti educations.name
      const jenjangPendidikan = institusiPendidikanMap.get(studentClass.education_id)?.institution_name || 'Tidak diketahui';

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
  }, [studentClassesResponse, studentsResponse, academicYears, institusiPendidikan, classroomsResponse, isLoading]);

  const handleOpenApprovalDialog = (data: PromotionData) => {
    setSelectedPromotion(data);
    setApprovalNote('');
    setIsApprovalDialogOpen(true);
  };

  const handleApprovalAction = async (action: 'approve' | 'reject') => {
    if (!selectedPromotion) return;

    const toastId = showLoading('Memperbarui status...');
    setIsUpdatingStatus(true);
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
      setIsUpdatingStatus(false);
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
      header: 'Pendidikan',
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
}