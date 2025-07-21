import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
import JenjangPendidikanForm from './JenjangPendidikanForm';
import { useGetEducationLevelsQuery, useDeleteEducationLevelMutation } from '@/store/slices/educationApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';

interface JenjangPendidikan {
  id: number;
  name: string;
  description: string;
}

const JenjangPendidikanTable: React.FC = () => {
  const { data: educationLevelsData, error, isLoading } = useGetEducationLevelsQuery();
  const [deleteEducationLevel] = useDeleteEducationLevelMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<JenjangPendidikan | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dataToDelete, setDataToDelete] = useState<JenjangPendidikan | undefined>(undefined);

  const educationLevels: JenjangPendidikan[] = useMemo(() => {
    if (educationLevelsData?.data) {
      return educationLevelsData.data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || 'Tidak ada deskripsi',
      }));
    }
    return [];
  }, [educationLevelsData]);

  const handleAddData = () => {
    setEditingData(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (data: JenjangPendidikan) => {
    setEditingData(data);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (data: JenjangPendidikan) => {
    setDataToDelete(data);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (dataToDelete) {
      try {
        await deleteEducationLevel(dataToDelete.id).unwrap();
        toast.success(`Jenjang Pendidikan "${dataToDelete.name}" berhasil dihapus.`);
      } catch (err) {
        const fetchError = err as FetchBaseQueryError;
        const errorMessage = (fetchError.data as { message?: string })?.message || 'Gagal menghapus data.';
        toast.error(errorMessage);
      } finally {
        setDataToDelete(undefined);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingData(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingData(undefined);
  };

  const columns: ColumnDef<JenjangPendidikan>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Nama Jenjang',
      },
      {
        accessorKey: 'description',
        header: 'Deskripsi',
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const data = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(data)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="destructive"
                className="h-8 px-2 text-xs"
                onClick={() => handleDeleteClick(data)}
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
        data={educationLevels}
        exportFileName="data_jenjang_pendidikan"
        exportTitle="Data Jenjang Pendidikan"
        onAddData={handleAddData}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingData ? 'Edit Jenjang Pendidikan' : 'Tambah Jenjang Pendidikan Baru'}</DialogTitle>
            <DialogDescription>
              {editingData ? 'Ubah detail jenjang pendidikan ini.' : 'Isi detail untuk jenjang pendidikan baru.'}
            </DialogDescription>
          </DialogHeader>
          <JenjangPendidikanForm
            initialData={editingData}
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
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus jenjang pendidikan{' '}
              <span className="font-semibold text-foreground">"{dataToDelete?.name}"</span> secara permanen.
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

export default JenjangPendidikanTable;