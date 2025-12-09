"use client";

import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import * as toast from '@/utils/toast';
import TipeIzinFormDialog from './TipeIzinFormDialog';
import {
  useGetLeaveTypesQuery,
  useCreateLeaveTypeMutation,
  useUpdateLeaveTypeMutation,
  useDeleteLeaveTypeMutation,
  type LeaveType,
} from '@/store/slices/leaveTypeApi';
import { RefreshCcw } from 'lucide-react';

const TipeIzinPage: React.FC = () => {
  const { data: items = [], isFetching, refetch } = useGetLeaveTypesQuery({ page: 1, per_page: 200 });
  const [createLeaveType] = useCreateLeaveTypeMutation();
  const [updateLeaveType] = useUpdateLeaveTypeMutation();
  const [deleteLeaveType] = useDeleteLeaveTypeMutation();

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<LeaveType | null>(null);

  const columns: ColumnDef<LeaveType>[] = [
    { header: 'Nama', accessorKey: 'name' },
    { header: 'Deskripsi', accessorKey: 'description' },
    { header: 'Butuh Persetujuan', id: 'requires_approval', accessorFn: (row) => (row.requires_approval ? 'Ya' : 'Tidak') },
    { header: 'Durasi Maks (hari)', accessorKey: 'max_duration_days' },
    { header: 'Aktif', id: 'is_active', accessorFn: (row) => (row.is_active ? 'Ya' : 'Tidak') },
    {
      header: 'Aksi',
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>Edit</Button>
            <Button variant="outline" size="sm" onClick={() => handleDelete(item)}>Hapus</Button>
          </div>
        );
      },
    },
  ];

  const handleAdd = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: LeaveType) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: LeaveType) => {
    const ok = window.confirm(`Hapus tipe izin "${item.name}"?`);
    if (!ok) return;
    await deleteLeaveType(item.id).unwrap();
    toast.showSuccess('Tipe izin berhasil dihapus!');
  };

  const handleSave = async (payload: {
    name: string;
    description: string;
    requires_approval: boolean;
    max_duration_days: number;
    is_active: boolean;
  }) => {
    if (editingItem) {
      await updateLeaveType({ id: editingItem.id, data: payload }).unwrap();
      toast.showSuccess('Tipe izin berhasil diperbarui!');
    } else {
      await createLeaveType(payload).unwrap();
      toast.showSuccess('Tipe izin berhasil ditambahkan!');
    }
    setIsDialogOpen(false);
  };

  const leftActions = (
    <div className="flex items-center gap-2">
      <Button onClick={handleAdd} size="sm">Tambah Tipe Izin</Button>
      <Button variant="outline" size="sm" onClick={() => refetch()} aria-label="Muat Ulang">
        <RefreshCcw className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <DashboardLayout title="Tipe Izin" role="administrasi">
      <div className="container mx-auto pt-2 pb-4 px-4">
        <CustomBreadcrumb
          items={[
            { label: 'Manajemen Kamtib', href: '/dashboard/manajemen-kamtib/pelanggaran' },
            { label: 'Tipe Izin' },
          ]}
        />
        <Card>
          <CardHeader>
            <CardTitle>Tipe Izin</CardTitle>
            <CardDescription>Kelola daftar tipe izin yang digunakan pada perizinan santri.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={items}
              isLoading={isFetching}
              exportFileName="tipe-izin"
              exportTitle="Daftar Tipe Izin"
              leftActions={leftActions}
              filterableColumns={{
                name: { placeholder: 'Filter nama...' },
                description: { placeholder: 'Filter deskripsi...' },
              }}
            />
          </CardContent>
        </Card>

        <TipeIzinFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          initialData={editingItem}
          onSave={handleSave}
        />
      </div>
    </DashboardLayout>
  );
};

export default TipeIzinPage;