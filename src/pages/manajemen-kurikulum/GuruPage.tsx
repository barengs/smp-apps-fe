import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { User, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useGetTeachersQuery, useDeleteTeacherMutation } from '@/store/slices/teacherApi';
import { UserWithStaffAndRoles } from '@/types/teacher';
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
import * as toast from '@/utils/toast'; // Baris ini diperbaiki

const GuruPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: apiResponse, isLoading, isError, error } = useGetTeachersQuery();
  const [deleteTeacher] = useDeleteTeacherMutation();

  // Data diambil dari API, jika tidak ada, gunakan array kosong
  const teachersData: UserWithStaffAndRoles[] = apiResponse?.data?.data || [];

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/administrasi' },
    { label: 'Manajemen Kurikulum', href: '/dashboard/manajemen-kurikulum/mata-pelajaran' },
    { label: 'Guru', icon: <User className="h-4 w-4" /> },
  ];

  const handleAddData = () => {
    navigate('/dashboard/manajemen-kurikulum/guru/add');
  };

  const handleEdit = (user: UserWithStaffAndRoles) => {
    toast.showInfo(`Aksi Edit untuk guru ${user.staff.first_name} ${user.staff.last_name}.`);
    navigate(`/dashboard/manajemen-kurikulum/guru/${user.staff.id}/edit`); // Menggunakan user.staff.id
  };

  const handleDelete = async (user: UserWithStaffAndRoles) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus guru ${user.staff.first_name} ${user.staff.last_name}?`)) {
      try {
        await deleteTeacher(user.staff.id).unwrap(); // Menggunakan user.staff.id
        toast.showSuccess('Guru berhasil dihapus!');
      } catch (err) {
        console.error('Gagal menghapus guru:', err);
        toast.showError('Gagal menghapus guru.');
      }
    }
  };

  const columns: ColumnDef<UserWithStaffAndRoles>[] = [ // Mengubah tipe ColumnDef
    {
      accessorFn: row => `${row.staff.first_name} ${row.staff.last_name}`.toUpperCase(),
      id: 'full_name',
      header: 'Nama Lengkap',
    },
    {
      accessorFn: row => row.staff.email, // Mengubah dari accessorKey
      id: 'email',
      header: 'Email',
    },
    {
      accessorFn: row => row.roles.map(role => role.name).join(', '), // Menampilkan nama peran
      id: 'roles',
      header: 'Peran',
    },
    {
      accessorFn: row => row.staff.status, // Mengubah dari accessorKey
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.staff.status; // Mengakses status dari objek staff
        let variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' = 'secondary';
        if (status === 'Aktif') variant = 'success';
        if (status === 'Tidak Aktif') variant = 'destructive';
        if (status === 'Cuti') variant = 'warning';
        return <Badge variant={variant} className="capitalize">{status}</Badge>;
      },
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const user = row.original; // Mengubah nama variabel dari teacher menjadi user
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
                  handleEdit(user);
                }}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(user);
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

  // Periksa apakah ada error dan bukan error 404 (data tidak ditemukan)
  if (isError && (error as FetchBaseQueryError).status !== 404) {
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
                data={teachersData} // Menggunakan data dari API
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