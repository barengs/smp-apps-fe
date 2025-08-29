import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { User, MoreHorizontal, Edit, Trash2 } from 'lucide-react';

import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useGetTeachersQuery, useDeleteTeacherMutation } from '@/store/slices/teacherApi';
import { Teacher } from '@/types/teacher';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import * as toast from '@/utils/toast';

const GuruPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: apiResponse, isLoading, isError, error } = useGetTeachersQuery();
  const [deleteTeacher] = useDeleteTeacherMutation();

  const teachersData = apiResponse?.data?.data || [];

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/administrasi' },
    { label: 'Manajemen Kurikulum', href: '/dashboard/manajemen-kurikulum/mata-pelajaran' },
    { label: 'Guru', icon: <User className="h-4 w-4" /> },
  ];

  const handleAddData = () => {
    navigate('/dashboard/manajemen-kurikulum/guru/add');
  };

  const handleEdit = (teacher: Teacher) => {
    navigate(`/dashboard/manajemen-kurikulum/guru/${teacher.id}/edit`);
  };

  const handleDelete = async (teacher: Teacher) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus guru ${teacher.first_name} ${teacher.last_name}?`)) {
      try {
        await deleteTeacher(teacher.id).unwrap();
        toast.showSuccess('Guru berhasil dihapus!');
      } catch (err) {
        console.error('Gagal menghapus guru:', err);
        toast.showError('Gagal menghapus guru.');
      }
    }
  };

  const columns: ColumnDef<Teacher>[] = [
    {
      accessorFn: row => `${row.first_name} ${row.last_name}`.toUpperCase(),
      id: 'full_name',
      header: 'Nama Lengkap',
    },
    {
      accessorKey: 'education_level',
      header: 'Jenjang Pendidikan',
    },
    {
      accessorKey: 'class_name',
      header: 'Kelas',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' = 'secondary';
        if (status === 'active') variant = 'success';
        if (status === 'inactive') variant = 'destructive';
        if (status === 'on_leave') variant = 'warning';
        return <Badge variant={variant} className="capitalize">{status}</Badge>;
      },
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const teacher = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(teacher);
                }}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(teacher);
                }}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isError) {
    console.error("Error fetching teachers:", error);
    return (
      <DashboardLayout title="Manajemen Guru" role="administrasi">
        <div className="text-red-500">Terjadi kesalahan saat memuat data guru. Silakan cek konsol untuk detail.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Manajemen Guru" role="administrasi">
      <div className="container mx-auto px-4 pb-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Manajemen Guru</CardTitle>
            <CardDescription>Kelola data guru di sini.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableLoadingSkeleton />
            ) : (
              <DataTable
                columns={columns}
                data={teachersData}
                exportFileName="data_guru"
                exportTitle="Data Guru"
                onAddData={handleAddData}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GuruPage;