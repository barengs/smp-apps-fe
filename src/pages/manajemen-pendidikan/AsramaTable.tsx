import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from '@/utils/toast';
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
import AsramaForm from './AsramaForm';
import { useGetHostelsQuery, useDeleteHostelMutation } from '@/store/slices/hostelApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';

interface Asrama {
  id: number;
  name: string;
  description: string;
}

const AsramaTable: React.FC = () => {
  const { data: hostelsData, error, isLoading } = useGetHostelsQuery();
  const [deleteHostel] = useDeleteHostelMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsrama, setEditingAsrama] = useState<Asrama | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [asramaToDelete, setAsramaToDelete] = useState<Asrama | undefined>(undefined);

  const asramas: Asrama[] = useMemo(() => {
    if (hostelsData?.data) {
      return hostelsData.data.map(apiHostel => ({
        id: apiHostel.id,
        name: apiHostel.name,
        description: apiHostel.description || 'Tidak ada deskripsi',
      }));
    }
    return [];
  }, [hostelsData]);

  const handleAddData = () => {
    setEditingAsrama(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (asrama: Asrama) => {
    setEditingAsrama(asrama);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (asrama: Asrama) => {
    setAsramaToDelete(asrama);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (asramaToDelete) {
      try {
        await deleteHostel(asramaToDelete.id).unwrap();
        toast.success(`Asrama "${asramaToDelete.name}" berhasil dihapus.`);
      } catch (err) {
        const fetchError = err as FetchBaseQueryError;
        const errorMessage = (fetchError.data as { message?: string })?.message || 'Gagal menghapus asrama.';
        toast.error(errorMessage);
      } finally {
        setAsramaToDelete(undefined);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingAsrama(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingAsrama(undefined);
  };

  const columns: ColumnDef<Asrama>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Nama Asrama',
      },
      {
        accessorKey: 'description',
        header: 'Deskripsi',
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const asrama = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(asrama)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="destructive"
                className="h-8 px-2 text-xs"
                onClick={() => handleDeleteClick(asrama)}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Hapus
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  if (isLoading) return <TableLoadingSkeleton numCols={3} />;

  const isNotFound = error && (error as FetchBaseQueryError).status === 404;
  if (error && !isNotFound) {
    return <div>Error: Gagal memuat data. Silakan coba lagi nanti.</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={asramas}
        exportFileName="data_asrama"
        exportTitle="Data Asrama"
        onAddData={handleAddData}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingAsrama ? 'Edit Asrama' : 'Tambah Asrama Baru'}</DialogTitle>
            <DialogDescription>
              {editingAsrama ? 'Ubah detail asrama ini.' : 'Isi detail untuk asrama baru.'}
            </DialogDescription>
          </DialogHeader>
          <AsramaForm
            initialData={editingAsrama}
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
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus asrama{' '}
              <span className="font-semibold text-foreground">"{asramaToDelete?.name}"</span> secara permanen.
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

export default AsramaTable;