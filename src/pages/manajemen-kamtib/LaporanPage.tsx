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
  useGetStudentViolationReportQuery,
} from '@/store/slices/studentViolationApi';
import StudentViolationFormDialog from '@/components/StudentViolationFormDialog';
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
          <Button variant="outline" size="sm" onClick={() => handleEdit(row.original)}>
            <Pencil className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(row.original)} disabled={isDeleting}>
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
    location: { type: 'input' as const, placeholder: 'Filter Lokasi' },
  };

  // Ringkasan laporan per santri
  const [selectedStudentId, setSelectedStudentId] = React.useState<number | undefined>(undefined);
  const { data: studentReport, isFetching: isFetchingReport } = useGetStudentViolationReportQuery(selectedStudentId as number, {
    skip: !selectedStudentId,
  });

  return (
    <DashboardLayout title="Laporan Pelanggaran" role="administrasi">
      <div className="container mx-auto pt-2 pb-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Tabel Laporan (2/3 lebar layar) */}
          <Card className="lg:col-span-2">
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
                leftActions={
                  <div className="w-64">
                    <SelectStudentForSummary
                      students={students}
                      value={selectedStudentId}
                      onChange={setSelectedStudentId}
                    />
                  </div>
                }
              />
            </CardContent>
          </Card>

          {/* Ringkasan Laporan Per Santri (1/3 lebar layar) */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Laporan</CardTitle>
              <CardDescription>
                Pilih santri di kiri untuk melihat ringkasan pelanggaran dan total poin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedStudentId ? (
                <div className="text-sm text-muted-foreground">Silakan pilih santri terlebih dahulu.</div>
              ) : isFetchingReport ? (
                <div className="text-sm">Memuat laporan...</div>
              ) : studentReport ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">Total Pelanggaran</div>
                      <div className="text-lg font-semibold">{studentReport.summary.total_violations}</div>
                    </div>
                    <div className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">Total Poin</div>
                      <div className="text-lg font-semibold">{studentReport.summary.total_points}</div>
                    </div>
                    <div className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">Pending</div>
                      <div className="text-lg font-semibold">{studentReport.summary.pending}</div>
                    </div>
                    <div className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">Diproses</div>
                      <div className="text-lg font-semibold">{studentReport.summary.processed}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Detail Pelanggaran</div>
                    <div className="rounded-md border p-3 max-h-64 overflow-auto text-sm whitespace-pre-wrap">
                      {studentReport.violations || 'Tidak ada detail pelanggaran.'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Laporan tidak tersedia.</div>
              )}
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
    </DashboardLayout>
  );
};

const SelectStudentForSummary: React.FC<{
  students: { id: number; nis: string; first_name: string; last_name?: string | null }[];
  value?: number;
  onChange: (id?: number) => void;
}> = ({ students, value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Santri:</span>
      <select
        className="border rounded-md h-8 px-2 text-sm bg-background"
        value={value ?? ''}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v ? Number(v) : undefined);
        }}
      >
        <option value="">Semua</option>
        {students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nis} — {s.first_name}{s.last_name ? ' ' + s.last_name : ''}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LaporanPage;