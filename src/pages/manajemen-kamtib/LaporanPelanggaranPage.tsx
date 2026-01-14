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
import { PaginationState } from '@tanstack/react-table';
import StudentViolationFormDialog from '@/components/StudentViolationFormDialog';
import ViolationStatsCard from '@/components/ViolationStatsCard';
import { useGetStudentViolationStatisticsQuery } from '@/store/slices/studentViolationApi';
import { useNavigate } from 'react-router-dom';
import * as toast from '@/utils/toast';
import { Pencil, PlusCircle } from 'lucide-react';

const LaporanPelanggaranPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Tata Tertib', href: '/dashboard/manajemen-kamtib/pelanggaran' },
    { label: 'Laporan' },
  ];

  // Fetch data untuk mapping tampilan
  const { data: students = [] } = useGetStudentsQuery({ page: 1, per_page: 200 });
  const { data: violations = [] } = useGetViolationsQuery();
  useGetTahunAjaranQuery(); // prefetch

  // Server-side pagination state (0-based pageIndex)
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const {
    data: reportsResp,
    isFetching,
  } = useGetStudentViolationsQuery({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
  });
  const reports = reportsResp?.data ?? [];
  const totalPages = reportsResp?.last_page ?? 1;

  // UPDATED: Hitung urutan pelanggaran per bulan PER SANTRI (berdasarkan created_at; fallback ke violation_date)
  const monthlyOrderMap = React.useMemo(() => {
    const map = new Map<number, number>();
    const groups = new Map<string, StudentViolation[]>();

    for (const r of reports) {
      const iso = r.created_at ?? r.violation_date;
      if (!iso) continue;
      const d = new Date(iso);
      if (isNaN(d.getTime())) continue;

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      // Pastikan grouping per santri
      const sidNum = typeof r.student_id === "number" ? r.student_id : Number((r as any).student_id ?? 0);
      const key = `${sidNum}-${year}-${month}`;

      const arr = groups.get(key) ?? [];
      arr.push(r);
      groups.set(key, arr);
    }

    for (const [, arr] of groups) {
      arr.sort((a, b) => {
        const ta = new Date(a.created_at ?? a.violation_date ?? 0).getTime();
        const tb = new Date(b.created_at ?? b.violation_date ?? 0).getTime();
        if (ta !== tb) return ta - tb;
        const ai = typeof a.id === "number" ? a.id : Number(a.id ?? 0);
        const bi = typeof b.id === "number" ? b.id : Number(b.id ?? 0);
        return ai - bi;
      });
      arr.forEach((item, idx) => {
        const idNum = typeof item.id === "number" ? item.id : Number(item.id ?? 0);
        map.set(idNum, idx + 1);
      });
    }

    return map;
  }, [reports]);

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

  // Statistik pelanggaran
  const { data: stats, isFetching: isStatsLoading } = useGetStudentViolationStatisticsQuery();

  // Dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingData, setEditingData] = React.useState<StudentViolation | null>(null);

  const navigate = useNavigate();

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
    navigate(`/dashboard/manajemen-kamtib/laporan-pelanggaran/${row.id}`);
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
    // NEW: Kolom Pelanggaran Ke (urut per bulan)
    {
      id: 'pelanggaran_ke',
      header: 'Pelanggaran Ke',
      cell: ({ row }) => {
        const idNum = typeof row.original.id === "number" ? row.original.id : Number(row.original.id ?? 0);
        const idx = monthlyOrderMap.get(idNum);
        return <span>{idx ?? '-'}</span>;
      },
    },
    {
      header: 'Tanggal',
      accessorKey: 'violation_date',
      cell: ({ row }) => {
        const d = row.original.violation_date ? new Date(row.original.violation_date) : null;
        return <span>{d ? d.toLocaleString('id-ID') : '-'}</span>;
      },
    },
    // REMOVED: Kolom 'Waktu' dan 'Lokasi'
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
          {/* REMOVED: Tombol Hapus */}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Data Laporan Pelanggaran</CardTitle>
                <CardDescription>Daftar laporan pelanggaran santri dengan fitur CRUD.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={reports}
                isLoading={isFetching}
                onAddData={handleAdd}
                addButtonLabel={<><PlusCircle className="mr-2 h-4 w-4" /> Tambah Data</>}
                filterableColumns={filterableColumns}
                onRowClick={handleRowClick}
                pageCount={totalPages}
                pagination={pagination}
                onPaginationChange={setPagination}
              />
            </CardContent>
          </Card>
          <div className="lg:col-span-1">
            <ViolationStatsCard stats={stats} isLoading={isStatsLoading} />
          </div>
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

// REMOVED: Komponen SelectStudentForSummary dan semua penggunaan ringkasan

export default LaporanPelanggaranPage;