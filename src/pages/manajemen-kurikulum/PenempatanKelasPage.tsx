import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { UserPlus, BookCopy, CheckCircle2, ChevronDown } from 'lucide-react';
import { useGetStudentClassesQuery, useUpdateStudentClassMutation } from '@/store/slices/studentClassApi';
import { useGetStudentsQuery } from '@/store/slices/studentApi';
import { useGetActiveTahunAjaranQuery, useGetTahunAjaranQuery } from '@/store/slices/tahunAjaranApi';
import { useGetClassroomsQuery } from '@/store/slices/classroomApi';
import { useGetInstitusiPendidikanQuery } from '@/store/slices/institusiPendidikanApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { DataTable } from '@/components/DataTable';
import { ColumnDef, FilterFn } from '@tanstack/react-table';
import { PaginationState } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PenempatanKelasDialog from './PenempatanKelasDialog';
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

interface PlacementData {
  id: number;
  class_id: number;
  siswa: string;
  tahunAjaran: string;
  jenjangPendidikan: string;
  kelas: string;
  rombel: string;
  statusApproval: string;
  tanggalPembuatan: string;
  education_id: number;
  class_group_id?: number | null;
}

export default function PenempatanKelasPage() {
  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>('');

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Kurikulum', href: '/dashboard/manajemen-kurikulum/penempatan-kelas', icon: <BookCopy className="h-4 w-4" /> },
    { label: 'Penempatan Kelas', icon: <UserPlus className="h-4 w-4" /> },
  ];

  const { data: activeAcademicYear } = useGetActiveTahunAjaranQuery();
  const { data: academicYears = [], isLoading: isLoadingAcademicYears } = useGetTahunAjaranQuery();

  React.useEffect(() => {
    if (activeAcademicYear && !selectedAcademicYearId) {
      setSelectedAcademicYearId(activeAcademicYear.id.toString());
    }
  }, [activeAcademicYear, selectedAcademicYearId]);

  const { data: studentClassesResponse, isLoading: isLoadingStudentClasses, isFetching: isFetchingStudentClasses, refetch } = useGetStudentClassesQuery({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
    academic_year_id: selectedAcademicYearId || undefined,
  });

  const { data: studentsResponse } = useGetStudentsQuery({});
  const { data: classroomsResponse } = useGetClassroomsQuery();
  const { data: institusiPendidikan } = useGetInstitusiPendidikanQuery({});
  const [updateStudentClass] = useUpdateStudentClassMutation();

  const isLoading = isLoadingStudentClasses || isLoadingAcademicYears || isFetchingStudentClasses;

  const placementData = React.useMemo(() => {
    if (!studentClassesResponse?.data || !Array.isArray(studentClassesResponse.data)) return [];

    return studentClassesResponse.data.map((studentClass: any): PlacementData => {
      const student = studentClass.students;
      const academicYear = studentClass.academic_years;
      const classroom = studentClass.classrooms;
      const education = studentClass.educations;
      const classGroup = studentClass.class_group;

      return {
        id: studentClass.id,
        class_id: studentClass.class_id,
        siswa: student ? `${student.first_name} ${student.last_name || ''}`.trim() : 'Tidak diketahui',
        tahunAjaran: academicYear ? (academicYear.year || academicYear.name) : 'Tidak diketahui',
        jenjangPendidikan: education?.institution_name || 'Tidak diketahui',
        kelas: classroom ? classroom.name : 'Tidak diketahui',
        rombel: classGroup ? classGroup.name : 'Tidak diketahui',
        statusApproval: studentClass.approval_status,
        tanggalPembuatan: new Date(studentClass.created_at).toLocaleDateString('id-ID'),
        education_id: studentClass.education_id,
        class_group_id: classGroup?.id ?? null,
      };
    });
  }, [studentClassesResponse]);

  const handleBulkApprove = async () => {
    if (!selectedIds.length) return;
    const selectedMap = new Map(placementData.map((p) => [p.id, p]));
    const targets = selectedIds
      .map((id) => selectedMap.get(id))
      .filter((x): x is PlacementData => !!x);

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
              approval_note: 'Persetujuan kolektif penempatan',
            },
          }).unwrap()
        )
      );
      dismissToast(toastId);
      showSuccess(`Berhasil menyetujui ${targets.length} data penempatan.`);
      setSelectedIds([]);
      refetch();
    } catch (err) {
      dismissToast(toastId);
      showError('Gagal menyetujui data terpilih.');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const columns: ColumnDef<PlacementData>[] = [
    {
      id: 'select',
      header: ({ table }) => {
        const displayedRows = table.getRowModel().rows;
        const displayedSelectableIds = displayedRows
          .map((r) => r.original as PlacementData)
          .filter((p) => (p.statusApproval || '').toLowerCase() !== 'disetujui')
          .map((p) => p.id);
        const isAllSelected =
          displayedSelectableIds.length > 0 &&
          displayedSelectableIds.every((id) => selectedIds.includes(id));
        return (
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={(checked) => {
              if (checked) {
                const set = new Set([...selectedIds, ...displayedSelectableIds]);
                setSelectedIds(Array.from(set));
              } else {
                setSelectedIds((prev) => prev.filter((id) => !displayedSelectableIds.includes(id)));
              }
            }}
          />
        );
      },
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.includes(row.original.id)}
          onCheckedChange={(checked) => {
            setSelectedIds(prev => checked ? [...prev, row.original.id] : prev.filter(id => id !== row.original.id));
          }}
          disabled={(row.original.statusApproval || '').toLowerCase() === 'disetujui'}
        />
      ),
      size: 32,
    },
    { accessorKey: 'tahunAjaran', header: 'Tahun Ajaran' },
    { accessorKey: 'jenjangPendidikan', header: 'Pendidikan' },
    { accessorKey: 'kelas', header: 'Kelas' },
    { accessorKey: 'rombel', header: 'Rombel' },
    { accessorKey: 'siswa', header: 'Siswa' },
    {
        accessorKey: 'statusApproval',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.statusApproval.toLowerCase();
          switch (status) {
            case 'disetujui': return <Badge variant="success">Disetujui</Badge>;
            case 'ditolak': return <Badge variant="destructive">Ditolak</Badge>;
            default: return <Badge variant="secondary">Diajukan</Badge>;
          }
        }
    },
  ];

  const leftActions = selectedIds.length > 0 ? (
    <Button variant="success" size="sm" onClick={() => setIsBulkDialogOpen(true)} disabled={isBulkUpdating}>
      <CheckCircle2 className="h-4 w-4 mr-1" />
      Setujui Terpilih ({selectedIds.length})
    </Button>
  ) : null;

  return (
    <DashboardLayout title="Penempatan Kelas Santri Baru" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Penempatan Kelas</CardTitle>
              <CardDescription>Pengelolaan kelas untuk santri baru yang belum memiliki riwayat kelas.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Tahun Ajaran:</span>
              <Select value={selectedAcademicYearId} onValueChange={setSelectedAcademicYearId}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {academicYears.map((ay: any) => (
                    <SelectItem key={ay.id} value={ay.id.toString()}>{ay.year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <TableLoadingSkeleton /> : (
              <DataTable
                columns={columns}
                data={placementData}
                onAddData={() => setIsPlacementModalOpen(true)}
                addButtonLabel="Tambah Penempatan"
                leftActions={leftActions}
                pagination={pagination}
                onPaginationChange={setPagination}
                pageCount={studentClassesResponse?.last_page || 0}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <PenempatanKelasDialog
        isOpen={isPlacementModalOpen}
        onClose={() => setIsPlacementModalOpen(false)}
        onAssignmentUpdate={refetch}
      />

      <AlertDialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Setujui Penempatan</AlertDialogTitle>
            <AlertDialogDescription>Setujui {selectedIds.length} data penempatan terpilih?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkApprove}>Setujui</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
