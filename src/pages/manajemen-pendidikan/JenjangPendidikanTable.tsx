import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
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
import JenjangPendidikanImportDialog from './JenjangPendidikanImportDialog';
import { useGetEducationLevelsQuery, useDeleteEducationLevelMutation } from '@/store/slices/educationApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';

// Mengimpor NestedEducationClass dari educationApi untuk konsistensi tipe
import type { NestedEducationClass } from '@/store/slices/educationApi';

interface JenjangPendidikan {
  id: number;
  name: string;
  description: string;
  education_class: NestedEducationClass[]; // Mengubah menjadi array objek
}

const JenjangPendidikanTable: React.FC = () => {
  const { data: educationLevelsData, error, isLoading } = useGetEducationLevelsQuery();
  const [deleteEducationLevel] = useDeleteEducationLevelMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<JenjangPendidikan | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dataToDelete, setDataToDelete] = useState<JenjangPendidikan | undefined>(undefined);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const educationLevels: JenjangPendidikan[] = useMemo(() => {
    if (educationLevelsData?.data) {
      return educationLevelsData.data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || 'Tidak ada deskripsi',
        // Memproses array education_class dan menggabungkan namanya
        education_class: item.education_class || [], // Pastikan ini array
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
        showSuccess(`Jenjang Pendidikan "${dataToDelete.name}" berhasil dihapus.`);
      } catch (err) {
        const fetchError = err as FetchBaseQueryError;
        const errorMessage = (fetchError.data as { message?: string })?.message || 'Gagal menghapus data.';
        showError(errorMessage);
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

  const handleImportData = () => {
    setIsImportModalOpen(true);
  };

  const columns: ColumnDef<JenjangPendidikan>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Nama Jenjang',
      },
      {
        accessorKey: 'education_class', // Mengakses properti education_class (array)
        header: 'Kelompok Pendidikan',
        cell: ({ row }) => {
          const educationClasses = row.original.education_class;
          // Menggabungkan nama-nama kelompok pendidikan menjadi satu string
          return educationClasses && educationClasses.length > 0
            ? educationClasses.map(ec => ec.name).join(', ')
            : 'Tidak ada';
        },
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
                variant="danger"
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

  // Treat 404 error as empty data, but show other errors
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
        onImportData={handleImportData}
        addButtonLabel="Tambah Jenjang Pendidikan"
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

      <JenjangPendidikanImportDialog
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </>
  );
};

export default JenjangPendidikanTable;