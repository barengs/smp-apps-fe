import React, { useMemo } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { BookCopy, Users } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { useGetClassGroupDetailsQuery } from '@/store/slices/classGroupApi';
import { useLocalPagination } from '@/hooks/useLocalPagination';

interface StudentClassRow {
  id: number;
  studentId: number;
  studentName: string;
  educationName: string;
  classroomName: string;
  classGroupName: string;
}

// REPLACED: interface untuk baris siswa menjadi agregasi per rombel
interface ClassGroupStatRow {
  classGroupId: number;
  educationName: string;
  classroomName: string;
  classGroupName: string;
  studentCount: number;
}

const SiswaPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: details, isLoading, isError } = useGetClassGroupDetailsQuery();
  const navigate = useNavigate();

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: t('sidebar.curriculum'), href: '/dashboard/manajemen-kurikulum/kenaikan-kelas', icon: <BookCopy className="h-4 w-4" /> },
    { label: t('sidebar.students'), icon: <Users className="h-4 w-4" /> },
  ];

  const rows: ClassGroupStatRow[] = useMemo(() => {
    const list = details?.data ?? [];
    return list.map((item) => ({
      classGroupId: Number(item?.id ?? 0),
      educationName: item?.educational_institution?.institution_name ?? '-',
      classroomName: item?.classroom?.name ?? '-',
      classGroupName: item?.name ?? '-',
      studentCount: Number(item?.total_students ?? 0),
    }));
  }, [details]);

  const columns: ColumnDef<ClassGroupStatRow>[] = [
    {
      accessorKey: 'educationName',
      header: 'Tingkat Pendidikan',
      cell: ({ row }) => <div className="capitalize">{row.original.educationName || '-'}</div>,
    },
    {
      accessorKey: 'classroomName',
      header: 'Kelas',
      cell: ({ row }) => <div className="capitalize">{row.original.classroomName || '-'}</div>,
    },
    {
      accessorKey: 'classGroupName',
      header: 'Rombel',
      cell: ({ row }) => <div className="capitalize">{row.original.classGroupName || '-'}</div>,
    },
    {
      accessorKey: 'studentCount',
      header: 'Jumlah Siswa',
      cell: ({ row }) => <div className="font-medium">{row.original.studentCount}</div>,
    },
  ];

  const educationOptions = useMemo(
    () => Array.from(new Set(rows.map(r => r.educationName).filter(v => v && v !== '-')))
      .map(name => ({ label: name, value: name })),
    [rows]
  );
  const classOptions = useMemo(
    () => Array.from(new Set(rows.map(r => r.classroomName).filter(v => v && v !== '-')))
      .map(name => ({ label: name, value: name })),
    [rows]
  );
  const classGroupOptions = useMemo(
    () => Array.from(new Set(rows.map(r => r.classGroupName).filter(v => v && v !== '-')))
      .map(name => ({ label: name, value: name })),
    [rows]
  );

  const handleRowClick = (row: ClassGroupStatRow) => {
    const q = new URLSearchParams({
      classGroupId: String(row.classGroupId || ''),
      education: row.educationName || '-',
      classroom: row.classroomName || '-',
      group: row.classGroupName || '-',
    }).toString();
    navigate(`/dashboard/manajemen-kurikulum/siswa/detail?${q}`);
  };

  const { paginatedData, pagination, setPagination, pageCount } = useLocalPagination(rows, 10);

  return (
    <DashboardLayout title={t('sidebar.students')} role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>{t('sidebar.students')}</CardTitle>
            <CardDescription>Jumlah siswa per kombinasi Tingkat Pendidikan, Kelas, dan Rombel.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableLoadingSkeleton numRows={8} />
            ) : isError ? (
              <div className="text-center text-red-500">Gagal memuat data siswa.</div>
            ) : (
              <DataTable
                columns={columns}
                data={paginatedData}
                exportFileName="SiswaKurikulum"
                exportTitle="Data Siswa Kurikulum"
                filterableColumns={{
                  educationName: { type: 'select', placeholder: 'Tingkat Pendidikan', options: educationOptions },
                  classroomName: { type: 'select', placeholder: 'Kelas', options: classOptions },
                  classGroupName: { type: 'select', placeholder: 'Rombel', options: classGroupOptions },
                }}
                pageCount={pageCount}
                pagination={pagination}
                onPaginationChange={setPagination}
                onRowClick={handleRowClick}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SiswaPage;