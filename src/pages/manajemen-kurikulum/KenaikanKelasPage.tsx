import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { BookCopy, TrendingUp, PlusCircle, FileText, CheckCircle2 } from 'lucide-react';
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
import { PaginationState } from '@tanstack/react-table';
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
  rombel: string;
  statusApproval: string;
  tanggalPembuatan: string;
  education_id: number; // Tambahkan properti education_id
  class_group_id?: number | null; // id rombel untuk update
}

export default function KenaikanKelasPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionData | null>(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const navigate = useNavigate();
  // Tambahkan state pagination (pageIndex berbasis 0, pageSize default 10)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Kurikulum', href: '/dashboard/manajemen-kurikulum/kenaikan-kelas', icon: <BookCopy className="h-4 w-4" /> },
    { label: 'Kenaikan Kelas', icon: <TrendingUp className="h-4 w-4" /> },
  ];

  // Mengambil data dari endpoint main/student-class dengan pagination
  const { data: studentClassesResponse, isLoading: isLoadingStudentClasses } = useGetStudentClassesQuery({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
  });
  const { data: studentsResponse, isLoading: isLoadingStudents } = useGetStudentsQuery({});
  const { data: academicYears, isLoading: isLoadingAcademicYears } = useGetTahunAjaranQuery();
  const { data: institusiPendidikan, isLoading: isLoadingInstitusiPendidikan } = useGetInstitusiPendidikanQuery({});
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

    if (!studentsResponse || !Array.isArray(studentsResponse)) {
      return [];
    }

    // Membuat peta untuk pencarian cepat
    const studentMap = new Map(studentsResponse?.map((s: any) => [s.id, s]) || []);
    const academicYearMap = new Map(academicYears?.map((ay: any) => [ay.id, ay]) || []);
    const institusiPendidikanMap = new Map((institusiPendidikan || []).map((ip: any) => [ip.id, ip]) || []);
    const classroomMap = new Map((classroomsResponse?.data || []).map((c: any) => [c.id, c]) || []);

    return studentClassesResponse.data.map((studentClass): PromotionData => {
      // Gunakan data yang sudah tersedia di response (jika ada)
      const student = studentClass.students || studentMap.get(studentClass.student_id);
      const academicYear = studentClass.academic_years || academicYearMap.get(studentClass.academic_year_id);
      const classroom = studentClass.classrooms; // Data classroom sudah tersedia di response
      const education = studentClass.educations; // Data education/jenjang pendidikan sudah tersedia di response
      const classGroup = studentClass.class_group; // Data rombel sudah tersedia di response
      
      // Untuk jenjang pendidikan, gunakan langsung dari properti educations.name
      const jenjangPendidikan = education?.institution_name || 'Tidak diketahui';

      const result = {
        id: studentClass.id,
        class_id: studentClass.class_id,
        siswa: student ? `${student.first_name} ${student.last_name || ''}`.trim() : 'Tidak diketahui',
        tahunAjaran: academicYear ? (academicYear.year || academicYear.name) : 'Tidak diketahui',
        jenjangPendidikan: jenjangPendidikan,
        kelas: classroom ? classroom.name : 'Tidak diketahui',
        rombel: classGroup ? classGroup.name : 'Tidak diketahui', // Tambahkan data rombel
        statusApproval: studentClass.approval_status,
        tanggalPembuatan: new Date(studentClass.created_at).toLocaleDateString('id-ID'),
        education_id: studentClass.education_id,
        class_group_id: classGroup?.id ?? null,
      };
      
      return result;
    });
  }, [studentClassesResponse, studentsResponse, academicYears, institusiPendidikan, classroomsResponse, isLoading]);

  // Bersihkan seleksi jika data berubah drastis atau status jadi disetujui
  React.useEffect(() => {
    if (!promotionData?.length) {
      if (selectedIds.length) setSelectedIds([]);
      return;
    }
    const validIds = new Set(
      promotionData
        .filter((p) => p.statusApproval?.toLowerCase() !== 'disetujui')
        .map((p) => p.id)
    );
    setSelectedIds((prev) => prev.filter((id) => validIds.has(id)));
  }, [promotionData]);

  // Hitung total halaman dari response paginasi backend
  const pageCount =
    studentClassesResponse?.last_page ??
    (studentClassesResponse?.total && studentClassesResponse?.per_page
      ? Math.ceil(studentClassesResponse.total / studentClassesResponse.per_page)
      : 0);

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
          classroom_id: selectedPromotion.class_id, // Tambahkan classroom_id
          class_group_id: selectedPromotion.class_group_id ?? selectedPromotion.class_id, // gunakan id rombel jika ada
          educational_institution_id: selectedPromotion.education_id, // Ganti dari education_id
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

  // Utility: toggle pilih baris
  const toggleSelect = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      } else {
        return prev.filter((x) => x !== id);
      }
    });
  };

  // Utility: toggle pilih semua baris yang sedang tampil (mengabaikan yang sudah disetujui)
  const handleToggleSelectAllDisplayed = (checked: boolean, displayedSelectableIds: number[]) => {
    setSelectedIds((prev) => {
      if (checked) {
        const set = new Set(prev);
        displayedSelectableIds.forEach((id) => set.add(id));
        return Array.from(set);
      } else {
        return prev.filter((id) => !displayedSelectableIds.includes(id));
      }
    });
  };

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

  // Opsi filter dropdown untuk Pendidikan, Kelas, Rombel
  const educationOptions = React.useMemo(
    () =>
      Array.from(
        new Set(promotionData.map((p) => p.jenjangPendidikan).filter(Boolean))
      ).map((v) => ({ label: String(v), value: String(v) })),
    [promotionData]
  );
  const classOptions = React.useMemo(
    () =>
      Array.from(new Set(promotionData.map((p) => p.kelas).filter(Boolean))).map(
        (v) => ({ label: String(v), value: String(v) })
      ),
    [promotionData]
  );
  const groupOptions = React.useMemo(
    () =>
      Array.from(new Set(promotionData.map((p) => p.rombel).filter(Boolean))).map(
        (v) => ({ label: String(v), value: String(v) })
      ),
    [promotionData]
  );

  // Tombol persetujuan kolektif di sisi kiri header tabel
  const leftActions = selectedIds.length > 0 ? (
    <Button
      variant="success"
      size="sm"
      onClick={() => setIsBulkDialogOpen(true)}
      disabled={isBulkUpdating}
      className="whitespace-nowrap"
    >
      <CheckCircle2 className="h-4 w-4 mr-1" />
      {isBulkUpdating ? 'Memproses...' : `Setujui Terpilih (${selectedIds.length})`}
    </Button>
  ) : null;

  const handleBulkApprove = async () => {
    if (!selectedIds.length) return;
    const selectedMap = new Map(promotionData.map((p) => [p.id, p]));
    const targets = selectedIds
      .map((id) => selectedMap.get(id))
      .filter((x): x is PromotionData => !!x);

    const toastId = showLoading(`Menyetujui ${targets.length} data...`);
    setIsBulkUpdating(true);
    try {
      await Promise.all(
        targets.map((item) =>
          updateStudentClass({
            id: item.id,
            data: {
              classroom_id: item.class_id,
              class_group_id: item.class_group_id ?? item.class_id,
              educational_institution_id: item.education_id,
              approval_status: 'disetujui',
              approval_note: 'Persetujuan kolektif',
            },
          }).unwrap()
        )
      );
      dismissToast(toastId);
      showSuccess(`Berhasil menyetujui ${targets.length} data.`);
      setSelectedIds([]);
    } catch (err) {
      dismissToast(toastId);
      showError('Gagal menyetujui data terpilih.');
      console.error(err);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Kolom untuk DataTable
  const columns: ColumnDef<PromotionData>[] = [
    {
      id: 'select',
      header: ({ table }) => {
        const displayedRows = table.getRowModel().rows;
        const displayedSelectableIds = displayedRows
          .map((r) => r.original as PromotionData)
          .filter((p) => (p.statusApproval || '').toLowerCase() !== 'disetujui')
          .map((p) => p.id);
        const isAllSelected =
          displayedSelectableIds.length > 0 &&
          displayedSelectableIds.every((id) => selectedIds.includes(id));
        return (
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={(checked) =>
              handleToggleSelectAllDisplayed(!!checked, displayedSelectableIds)
            }
            aria-label="Pilih semua yang tampil"
          />
        );
      },
      cell: ({ row }) => {
        const data = row.original;
        return (
          <Checkbox
            checked={selectedIds.includes(data.id)}
            onCheckedChange={(checked) => toggleSelect(data.id, !!checked)}
            disabled={(data.statusApproval || '').toLowerCase() === 'disetujui'}
            aria-label="Pilih data"
          />
        );
      },
      size: 32,
    },
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
      accessorKey: 'rombel',
      header: 'Rombel',
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
                addButtonLabel="Atur Kelas"
                leftActions={leftActions}
                filterableColumns={{
                  jenjangPendidikan: { type: 'select', placeholder: 'Pendidikan', options: educationOptions },
                  kelas: { type: 'select', placeholder: 'Kelas', options: classOptions },
                  rombel: { type: 'select', placeholder: 'Rombel', options: groupOptions },
                }}
                // Tambahan: aktifkan server-side pagination
                pageCount={pageCount || 0}
                pagination={pagination}
                onPaginationChange={setPagination}
              />
            )}
          </CardContent>
        </Card>
      </div>
      {/* Modal konfirmasi persetujuan kolektif */}
      <AlertDialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Persetujuan Kolektif</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan menyetujui {selectedIds.length} data yang dipilih. Tindakan ini akan memperbarui status menjadi "Disetujui".
              Apakah Anda yakin ingin melanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsBulkDialogOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await handleBulkApprove();
                setIsBulkDialogOpen(false);
              }}
            >
              Setujui
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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