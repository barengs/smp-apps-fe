import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useGetStudentsQuery } from '@/store/slices/studentApi';
import { useGetViolationsQuery } from '@/store/slices/violationApi';
import { useGetTahunAjaranQuery } from '@/store/slices/tahunAjaranApi';
import {
  StudentViolation,
  useGetStudentViolationsQuery,
  useDeleteStudentViolationMutation,
} from '@/store/slices/studentViolationApi';
import StudentViolationFormDialog from '@/components/StudentViolationFormDialog';
import StudentViolationDetailModal from '@/components/StudentViolationDetailModal';
import { Pencil, Trash } from 'lucide-react';
import * as toast from '@/utils/toast';

const LaporanPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Tata Tertib', href: '/dashboard/manajemen-kamtib/pelanggaran' },
    { label: 'Laporan' },
  ];

  // Fetch data untuk mapping tampilan
  const { data: students = [] } = useGetStudentsQuery({ page: 1, per_page: 200 });
  const { data: violations = [] } = useGetViolationsQuery();
  useGetTahunAjaranQuery(); // prefetch

  const { data: reports = [], isFetching } = useGetStudentViolationsQuery();
  const [deleteReport, { isLoading: isDeleting }] = useDeleteStudentViolationMutation();

  const studentMap = React.useMemo(() => {
    const m = new Map<number, string>();
    for (const s of students) {
      m.set(s.id, `${s.nis} — ${s.first_name}${s.last_name ? ' ' + s.last_name : ''}`);
    }
    return m;
  }, [students]);

  const violationMap = React.useMemo(() => {
    const m = new Map<number, string>();
    for (const v of violations) {
      m.set(v.id, `${v.name} (${v.point} poin)`);
    }
    return m;
  }, [violations]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingData, setEditingData] = React.useState<StudentViolation | null>(null);
  // State untuk modal detail saat baris diklik
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [selectedReport, setSelectedReport] = React.useState<StudentViolation | null>(null);

  const handleAdd = () => {
    setEditingData(null);
    setDialogOpen(true);
  };

  const handleEdit = (row: StudentViolation) => {
    setEditingData(row);
    setDialogOpen(true);
  };

  const handleDelete = async (row: StudentViolation) => {
    if (!window.confirm('Hapus laporan ini?')) return;
    const loadingId = toast.showLoading('Menghapus laporan...');
    try {
      await deleteReport(row.id).unwrap();
      toast.showSuccess('Laporan berhasil dihapus!');
    } finally {
      toast.dismissToast(loadingId);
    }
  };

  const handleRowClick = (row: StudentViolation) => {
    setSelectedReport(row);
    setDetailOpen(true);
  };

  const columns: ColumnDef<StudentViolation>[] = [
    {
      header: 'Santri',
      accessorKey: 'student_id',
      cell: ({ row }) => <span>{studentMap.get(row.original.student_id) || row.original.student_id}</span>,
    },
    {
      header: 'Pelanggaran',
      accessorKey: 'violation_id',
      cell: ({ row }) => <span>{violationMap.get(row.original.violation_id) || row.original.violation_id}</span>,
    },
    {
      header: 'Tanggal',
      accessorKey: 'violation_date',
      cell: ({ row }) => {
        const d = row.original.violation_date ? new Date(row.original.violation_date) : null;
        return <span>{d ? d.toLocaleString('id-ID') : '-'}</span>;
      },
    },
    {
      header: 'Waktu',
      accessorKey: 'violation_time',
    },
    {
      header: 'Lokasi',
      accessorKey: 'location',
    },
    {
      header: 'Deskripsi',
      accessorKey: 'description',
    },
    {
      header: 'Catatan',
      accessorKey: 'notes',
    },
    {
      id: 'aksi',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row.original);
            }}
          >
            <Pencil className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.original);
            }}
            disabled={isDeleting}
          >
            <Trash className="h-4 w-4 mr-2" /> Hapus
          </Button>
        </div>
      ),
    },
  ];

  const filterableColumns = {
    violation_id: {
      type: 'select' as const,
      placeholder: 'Filter Pelanggaran',
      options: violations.map((v) => ({ label: v.name, value: String(v.id) })),
    },
  };

  // REMOVED: State & query untuk ringkasan laporan per santri

  return (
    <DashboardLayout title="Laporan Pelanggaran" role="administrasi">
      <div className="container mx-auto pt-2 pb-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Laporan Pelanggaran</CardTitle>
              <CardDescription>Daftar laporan pelanggaran santri dengan fitur CRUD.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={reports}
                isLoading={isFetching}
                onAddData={handleAdd}
                addButtonLabel="Tambah Data"
                filterableColumns={filterableColumns}
                onRowClick={handleRowClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog Form */}
      <StudentViolationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingData}
        onSuccess={() => {
          // RTK Query invalidation akan otomatis refresh tabel
        }}
      />

      {/* Modal Detail Laporan */}
      <StudentViolationDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        report={selectedReport}
        studentLabel={
          selectedReport ? (studentMap.get(selectedReport.student_id) ?? String(selectedReport.student_id)) : undefined
        }
        violationLabel={
          selectedReport ? (violationMap.get(selectedReport.violation_id) ?? String(selectedReport.violation_id)) : undefined
        }
      />
    </DashboardLayout>
  );
};

// REMOVED: Komponen SelectStudentForSummary dan semua penggunaan ringkasan

export default LaporanPage;