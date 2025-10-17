import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast'; // Updated import
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
import RombelForm from './RombelForm';
import { useGetClassGroupsQuery, useDeleteClassGroupMutation } from '@/store/slices/classGroupApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';
import { useLocalPagination } from '@/hooks/useLocalPagination';

interface Rombel {
  id: number;
  name: string;
  classroom_id: number;
  classroom: {
    name: string;
  };
}

const RombelTable: React.FC = () => {
  const { data: classGroupsData, error, isLoading } = useGetClassGroupsQuery();
  const [deleteClassGroup] = useDeleteClassGroupMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRombel, setEditingRombel] = useState<Rombel | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rombelToDelete, setRombelToDelete] = useState<Rombel | undefined>(undefined);

  const rombels: Rombel[] = useMemo(() => {
    return classGroupsData?.data || [];
  }, [classGroupsData]);

  const { paginatedData, pagination, setPagination, pageCount } = useLocalPagination<Rombel>(rombels);

  const handleAddData = () => {
    setEditingRombel(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (rombel: Rombel) => {
    setEditingRombel(rombel);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (rombel: Rombel) => {
    setRombelToDelete(rombel);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (rombelToDelete) {
      try {
        await deleteClassGroup(rombelToDelete.id).unwrap();
        showSuccess(`Rombel "${rombelToDelete.name}" berhasil dihapus.`); // Updated call
      } catch (err) {
        const fetchError = err as FetchBaseQueryError;
        const errorMessage = (fetchError.data as { message?: string })?.message || 'Gagal menghapus rombel.';
        showError(errorMessage); // Updated call
      } finally {
        setRombelToDelete(undefined);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingRombel(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingRombel(undefined);
  };

  const columns: ColumnDef<Rombel>[] = useMemo(
    () => [
      {
        accessorFn: row => row.classroom.name,
        id: 'classroomName',
        header: 'Kelas',
      },
      {
        accessorKey: 'name',
        header: 'Nama Rombel',
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const rombel = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(rombel)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="danger"
                className="h-8 px-2 text-xs"
                onClick={() => handleDeleteClick(rombel)}
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
        data={paginatedData}
        exportFileName="data_rombel"
        exportTitle="Data Rombongan Belajar"
        onAddData={handleAddData}
        addButtonLabel="Tambah Rombel"
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingRombel ? 'Edit Rombel' : 'Tambah Rombel Baru'}</DialogTitle>
            <DialogDescription>
              {editingRombel ? 'Ubah detail rombel ini.' : 'Isi detail untuk rombel baru.'}
            </DialogDescription>
          </DialogHeader>
          <RombelForm
            initialData={editingRombel}
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
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus rombel{' '}
              <span className="font-semibold text-foreground">"{rombelToDelete?.name}"</span> secara permanen.
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

export default RombelTable;