import React, { useMemo } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { BookCopy, Users } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { useGetStudentClassesQuery } from '@/store/slices/studentClassApi';
import { useNavigate } from 'react-router-dom';
import { useLocalPagination } from '@/hooks/useLocalPagination';

interface StudentClassRow {
  id: number;
  studentId: number;
  studentName: string;
  educationName: string;
  classroomName: string;
  classGroupName: string;
}

const SiswaPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: paged, isLoading, isError } = useGetStudentClassesQuery({});

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: t('sidebar.curriculum'), href: '/dashboard/manajemen-kurikulum/kenaikan-kelas', icon: <BookCopy className="h-4 w-4" /> },
    { label: t('sidebar.students'), icon: <Users className="h-4 w-4" /> },
  ];

  const rows: StudentClassRow[] = useMemo(() => {
    const list = paged?.data ?? [];
    return list.map((sc: any) => {
      const firstName = sc?.students?.first_name ?? '';
      const lastName = sc?.students?.last_name ?? '';
      const fullName = `${firstName} ${lastName}`.trim() || sc?.students?.name || '-';

      return {
        id: sc.id,
        studentId: sc.student_id,
        studentName: fullName,
        educationName: sc?.educations?.name ?? '-',
        classroomName: sc?.classrooms?.name ?? '-',
        classGroupName: sc?.class_group?.name ?? '-',
      };
    });
  }, [paged]);

  const columns: ColumnDef<StudentClassRow>[] = [
    {
      accessorKey: 'studentName',
      header: 'Nama Siswa',
      cell: ({ row }) => <div className="capitalize">{row.original.studentName}</div>,
    },
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

  const handleRowClick = (row: StudentClassRow) => {
    if (!row.studentId) return;
    navigate(`/dashboard/santri/${row.studentId}`);
  };

  const { paginatedData, pagination, setPagination, pageCount } = useLocalPagination(rows, 10);

  return (
    <DashboardLayout title={t('sidebar.students')} role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>{t('sidebar.students')}</CardTitle>
            <CardDescription>Daftar siswa dengan info tingkat pendidikan, kelas, dan rombel.</CardDescription>
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
                onRowClick={handleRowClick}
                filterableColumns={{
                  educationName: { type: 'select', placeholder: 'Tingkat Pendidikan', options: educationOptions },
                  classroomName: { type: 'select', placeholder: 'Kelas', options: classOptions },
                  classGroupName: { type: 'select', placeholder: 'Rombel', options: classGroupOptions },
                }}
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

export default SiswaPage;