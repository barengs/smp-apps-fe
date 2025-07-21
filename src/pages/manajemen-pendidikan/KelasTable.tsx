import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
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
import KelasForm from './KelasForm';
import { useGetClassroomsQuery, useDeleteClassroomMutation } from '@/store/slices/classroomApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';
import { toast } from 'sonner';

interface Kelas {
  id: number;
  name: string;
  parent_id: number | null;
  description: string;
}

const KelasTable: React.FC = () => {
  const { data: classroomsData, error, isLoading } = useGetClassroomsQuery();
  const [deleteClassroom] = useDeleteClassroomMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [kelasToDelete, setKelasToDelete] = useState<Kelas | undefined>(undefined);

  const classrooms: Kelas[] = useMemo(() => {
    if (classroomsData?.data) {
      return classroomsData.data.map(c => ({
        id: c.id,
        name: c.name,
        parent_id: c.parent_id,
        description: c.description || 'Tidak ada deskripsi',
      }));
    }
    return [];
  }, [classroomsData]);

  const handleAddData = () => {
    setEditingKelas(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (kelas: Kelas) => {
    setEditingKelas(kelas);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (kelas: Kelas) => {
    setKelasToDelete(kelas);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (kelasToDelete) {
      try {
        await deleteClassroom(kelasToDelete.id).unwrap();
        toast.success(`Kelas "${kelasToDelete.name}" berhasil dihapus.`);
      } catch (err) {
        const fetchError = err as FetchBaseQueryError;
        const errorMessage = (fetchError.data as { message?: string })?.message || 'Gagal menghapus kelas.';
        toast.error(errorMessage);
      } finally {
        setKelasToDelete(undefined);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingKelas(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingKelas(undefined);
  };

  const columns: ColumnDef<Kelas>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Nama Kelas',
      },
      {
        accessorKey: 'parent_id',
        header: 'Induk Kelas',
        cell: ({ row }) => {
          const parentId = row.original.parent_id;
          if (!parentId) return '-';
          const parent = classrooms.find(c => c.id === parentId);
          return parent ? parent.name : `ID: ${parentId}`;
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
          const kelas = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(kelas)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="destructive"
                className="h-8 px-2 text-xs"
                onClick={() => handleDeleteClick(kelas)}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Hapus
              </Button>
            </div>
          );
        },
      },
    ],
    [classrooms]
  );

  if (isLoading) return <TableLoadingSkeleton numCols={4} />;

  const isNotFound = error && (error as FetchBaseQueryError).status === 404;
  if (error && !isNotFound) {
    return <div>Error: Gagal memuat data. Silakan coba lagi nanti.</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={classrooms}
        exportFileName="data_kelas"
        exportTitle="Data Kelas"
        onAddData={handleAddData}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingKelas ? 'Edit Kelas' : 'Tambah Kelas Baru'}</DialogTitle>
            <DialogDescription>
              {editingKelas ? 'Ubah detail kelas ini.' : 'Isi detail untuk kelas baru.'}
            </DialogDescription>
          </DialogHeader>
          <KelasForm
            initialData={editingKelas}
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
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus kelas{' '}
              <span className="font-semibold text-foreground">"{kelasToDelete?.name}"</span> secara permanen.
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

export default KelasTable;