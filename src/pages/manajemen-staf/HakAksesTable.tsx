import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import * as toast from '@/utils/toast';
import { DataTable } from '../../components/DataTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import HakAksesForm from './HakAksesForm';
import { useGetPermissionsQuery, useDeletePermissionMutation } from '@/store/slices/permissionApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';
import ActionButton from '@/components/ActionButton';

interface HakAkses {
  id: number;
  name: string;
  description: string;
}

const HakAksesTable: React.FC = () => {
  const { data: permissionsData, error, isLoading } = useGetPermissionsQuery({});
  const [deletePermission] = useDeletePermissionMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHakAkses, setEditingHakAkses] = useState<HakAkses | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hakAksesToDelete, setHakAksesToDelete] = useState<HakAkses | undefined>(undefined);

  const permissions: HakAkses[] = useMemo(() => {
    if (permissionsData?.data) {
      return permissionsData.data.map(apiPermission => ({
        id: apiPermission.id,
        name: apiPermission.name,
        description: apiPermission.description || 'Tidak ada deskripsi',
      }));
    }
    return [];
  }, [permissionsData]);

  const handleAddData = () => {
    setEditingHakAkses(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (hakAkses: HakAkses) => {
    setEditingHakAkses(hakAkses);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (hakAkses: HakAkses) => {
    setHakAksesToDelete(hakAkses);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (hakAksesToDelete) {
      try {
        await deletePermission(hakAksesToDelete.id).unwrap();
        toast.showSuccess(`Hak akses "${hakAksesToDelete.name}" berhasil dihapus.`);
      } catch (err) {
        const fetchError = err as FetchBaseQueryError;
        const errorMessage = (fetchError.data as { message?: string })?.message || 'Gagal menghapus hak akses.';
        toast.showError(errorMessage);
      } finally {
        setHakAksesToDelete(undefined);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingHakAkses(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingHakAkses(undefined);
  };

  const columns: ColumnDef<HakAkses>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Nama Hak Akses',
        cell: (info) => <span className="font-mono bg-muted p-1 rounded">{info.getValue() as string}</span>,
      },
      {
        accessorKey: 'description',
        header: 'Deskripsi',
        cell: (info) => info.getValue(),
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const hakAkses = row.original;
          return (
            <div className="flex space-x-2">
              <ActionButton
                variant="outline"
                size="sm"
                onClick={() => handleEditData(hakAkses)}
                icon={<Edit className="h-4 w-4" />}
              >
                Edit
              </ActionButton>
              <ActionButton
                variant="danger"
                size="sm"
                onClick={() => handleDeleteClick(hakAkses)}
                icon={<Trash2 className="h-4 w-4" />}
              >
                Hapus
              </ActionButton>
            </div>
          );
        },
      },
    ],
    []
  );

  if (isLoading) return <TableLoadingSkeleton numCols={3} />;

  // Treat 404 error as empty data, but show other errors
  const isNotFound = error && (error as FetchBaseQueryError).status === 404;
  if (error && !isNotFound) {
    return <div>Error: Gagal memuat data. Silakan coba lagi nanti.</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={permissions}
        exportFileName="data_hak_akses"
        exportTitle="Data Hak Akses"
        onAddData={handleAddData}
        addButtonLabel="Tambah Hak Akses"
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingHakAkses ? 'Edit Hak Akses' : 'Tambah Hak Akses Baru'}</DialogTitle>
            <DialogDescription>
              {editingHakAkses ? 'Ubah detail hak akses ini.' : 'Isi detail untuk hak akses baru.'}
            </DialogDescription>
          </DialogHeader>
          <HakAksesForm
            initialData={editingHakAkses}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus hak akses{' '}
              <span className="font-semibold text-foreground">"{hakAksesToDelete?.name}"</span> secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Lanjutkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default HakAksesTable;