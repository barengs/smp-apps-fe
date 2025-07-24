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
import KelompokPendidikanForm from './KelompokPendidikanForm';
import { useGetEducationGroupsQuery, useDeleteEducationGroupMutation } from '@/store/slices/educationGroupApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';

interface EducationGroup {
  id: number;
  name: string;
  description: string;
}

const KelompokPendidikanTable: React.FC = () => {
  const { data: educationGroupsData, error, isLoading } = useGetEducationGroupsQuery();
  const [deleteEducationGroup] = useDeleteEducationGroupMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEducationGroup, setEditingEducationGroup] = useState<EducationGroup | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [educationGroupToDelete, setEducationGroupToDelete] = useState<EducationGroup | undefined>(undefined);

  const educationGroups: EducationGroup[] = useMemo(() => {
    return educationGroupsData?.data || [];
  }, [educationGroupsData]);

  const handleAddData = () => {
    setEditingEducationGroup(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (educationGroup: EducationGroup) => {
    setEditingEducationGroup(educationGroup);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (educationGroup: EducationGroup) => {
    setEducationGroupToDelete(educationGroup);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (educationGroupToDelete) {
      try {
        await deleteEducationGroup(educationGroupToDelete.id).unwrap();
        showSuccess(`Kelompok Pendidikan "${educationGroupToDelete.name}" berhasil dihapus.`);
      } catch (err) {
        const fetchError = err as FetchBaseQueryError;
        const errorMessage = (fetchError.data as { message?: string })?.message || 'Gagal menghapus kelompok pendidikan.';
        showError(errorMessage);
      } finally {
        setEducationGroupToDelete(undefined);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingEducationGroup(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingEducationGroup(undefined);
  };

  const columns: ColumnDef<EducationGroup>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Nama Kelompok Pendidikan',
      },
      {
        accessorKey: 'description',
        header: 'Deskripsi',
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const educationGroup = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(educationGroup)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="destructive"
                className="h-8 px-2 text-xs"
                onClick={() => handleDeleteClick(educationGroup)}
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
        data={educationGroups}
        exportFileName="data_kelompok_pendidikan"
        exportTitle="Data Kelompok Pendidikan"
        onAddData={handleAddData}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingEducationGroup ? 'Edit Kelompok Pendidikan' : 'Tambah Kelompok Pendidikan Baru'}</DialogTitle>
            <DialogDescription>
              {editingEducationGroup ? 'Ubah detail kelompok pendidikan ini.' : 'Isi detail untuk kelompok pendidikan baru.'}
            </DialogDescription>
          </DialogHeader>
          <KelompokPendidikanForm
            initialData={editingEducationGroup}
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
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus kelompok pendidikan{' '}
              <span className="font-semibold text-foreground">"{educationGroupToDelete?.name}"</span> secara permanen.
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

export default KelompokPendidikanTable;