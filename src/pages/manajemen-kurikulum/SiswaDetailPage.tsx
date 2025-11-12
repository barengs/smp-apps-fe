import React, { useMemo } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { BookCopy, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { useGetClassGroupStudentsQuery } from '@/store/slices/studentClassApi';
import { useSearchParams } from 'react-router-dom';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { useLocalPagination } from '@/hooks/useLocalPagination';

interface StudentListRow {
  id: number;
  studentId: number;
  studentName: string;
  nis?: string;
  gender?: string;
}

const SiswaDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const educationName = searchParams.get('education') || '-';
  const classroomName = searchParams.get('classroom') || '-';
  const classGroupName = searchParams.get('group') || '-';

  const classGroupIdParam = searchParams.get('classGroupId') || '';
  const classGroupId = Number(classGroupIdParam) || 0;
  const { data: students, isLoading, isError } = useGetClassGroupStudentsQuery(classGroupId);

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: t('sidebar.curriculum'), href: '/dashboard/manajemen-kurikulum/kenaikan-kelas', icon: <BookCopy className="h-4 w-4" /> },
    { label: t('sidebar.students'), href: '/dashboard/manajemen-kurikulum/siswa', icon: <Users className="h-4 w-4" /> },
    { label: 'Detil Rombel', icon: <Users className="h-4 w-4" /> },
  ];

  const studentsInGroup: StudentListRow[] = useMemo(() => {
    const list = students ?? [];
    return list.map((item: any) => {
      const st = item?.student ?? {};
      const firstName = st?.first_name ?? '';
      const lastName = st?.last_name ?? '';
      const fullName = `${firstName} ${lastName}`.trim() || st?.name || '-';
      return {
        id: st?.id ?? item?.id,
        studentId: st?.id ?? item?.id,
        studentName: fullName,
        nis: st?.nis ?? '-', // jika API tidak menyediakan NIS, tampilkan '-'
        gender: st?.gender ?? '-',
      };
    });
  }, [students]);

  const columns: ColumnDef<StudentListRow>[] = [
    {
      accessorKey: 'studentName',
      header: 'Nama Siswa',
      cell: ({ row }) => <div className="capitalize">{row.original.studentName}</div>,
    },
    {
      accessorKey: 'nis',
      header: 'NIS',
      cell: ({ row }) => <div className="font-medium">{row.original.nis}</div>,
    },
    {
      accessorKey: 'gender',
      header: 'Jenis Kelamin',
      cell: ({ row }) => (
        <Badge variant="secondary" className="capitalize">{row.original.gender || '-'}</Badge>
      ),
    },
  ];

  const { paginatedData, pagination, setPagination, pageCount } = useLocalPagination(studentsInGroup, 10);

  return (
    <DashboardLayout title="Detil Rombel" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Detil Rombel</CardTitle>
            <CardDescription>Informasi rombel yang dipilih dan daftar siswa di dalamnya.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-md border">
                <div className="text-sm text-muted-foreground">Tingkat Pendidikan</div>
                <div className="font-medium">{educationName}</div>
              </div>
              <div className="p-4 rounded-md border">
                <div className="text-sm text-muted-foreground">Kelas</div>
                <div className="font-medium">{classroomName}</div>
              </div>
              <div className="p-4 rounded-md border">
                <div className="text-sm text-muted-foreground">Rombel</div>
                <div className="font-medium">{classGroupName}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Siswa</CardTitle>
            <CardDescription>Semua siswa dalam rombel ini.</CardDescription>
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
                exportFileName="DetilRombelSiswa"
                exportTitle="Daftar Siswa per Rombel"
                pageCount={pageCount}
                pagination={pagination}
                onPaginationChange={setPagination}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SiswaDetailPage;