"use client";

import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import * as toast from '@/utils/toast';
import JenisSanksiFormDialog from './JenisSanksiFormDialog';
import {
  useGetSanctionTypesQuery,
  useCreateSanctionTypeMutation,
  useUpdateSanctionTypeMutation,
  useDeleteSanctionTypeMutation,
  type SanctionType,
} from '@/store/slices/sanctionTypeApi';
import { RefreshCcw } from 'lucide-react';

const JenisSanksiPage: React.FC = () => {
  const { data: items = [], isFetching, refetch } = useGetSanctionTypesQuery();
  const [createSanctionType] = useCreateSanctionTypeMutation();
  const [updateSanctionType] = useUpdateSanctionTypeMutation();
  const [deleteSanctionType] = useDeleteSanctionTypeMutation();

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<SanctionType | null>(null);

  const columns: ColumnDef<SanctionType>[] = [
    { header: 'Nama', accessorKey: 'name' },
    { header: 'Deskripsi', accessorKey: 'description' },
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

  const handleEdit = (item: SanctionType) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: SanctionType) => {
    const ok = window.confirm(`Hapus jenis sanksi "${item.name}"?`);
    if (!ok) return;
    await deleteSanctionType(item.id).unwrap();
    toast.showSuccess('Jenis sanksi berhasil dihapus!');
  };

  const handleSave = async (payload: {
    name: string;
    description: string;
    is_active: boolean;
  }) => {
    if (editingItem) {
      await updateSanctionType({ id: editingItem.id, data: payload }).unwrap();
      toast.showSuccess('Jenis sanksi berhasil diperbarui!');
    } else {
      await createSanctionType(payload).unwrap();
      toast.showSuccess('Jenis sanksi berhasil ditambahkan!');
    }
    setIsDialogOpen(false);
  };

  const leftActions = (
    <div className="flex items-center gap-2">
      <Button onClick={handleAdd} size="sm">Tambah Jenis Sanksi</Button>
      <Button variant="outline" size="sm" onClick={() => refetch()} aria-label="Muat Ulang">
        <RefreshCcw className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <DashboardLayout title="Jenis Sanksi" role="administrasi">
      <div className="container mx-auto pt-2 pb-4 px-4">
        <CustomBreadcrumb
          items={[
            { label: 'Manajemen Kamtib', href: '/dashboard/manajemen-kamtib/pelanggaran' },
            { label: 'Jenis Sanksi' },
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
              exportFileName="jenis-sanksi"
              exportTitle="Daftar Jenis Sanksi"
              leftActions={leftActions}
            />
          </CardContent>
        </Card>

        <JenisSanksiFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          initialData={editingItem}
          onSave={handleSave}
        />
      </div>
    </DashboardLayout>
  );
};

export default JenisSanksiPage;