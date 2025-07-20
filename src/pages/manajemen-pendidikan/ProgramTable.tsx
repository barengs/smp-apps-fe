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
import ProgramForm from './ProgramForm';
import { useGetProgramsQuery, useDeleteProgramMutation } from '@/store/slices/programApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';

interface Program {
  id: number;
  name: string;
  description: string;
}

const ProgramTable: React.FC = () => {
  const { data: programsData, error, isLoading } = useGetProgramsQuery();
  const [deleteProgram] = useDeleteProgramMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<Program | undefined>(undefined);

  const programs: Program[] = useMemo(() => {
    if (programsData?.data) {
      return programsData.data.map(apiProgram => ({
        id: apiProgram.id,
        name: apiProgram.name,
        description: apiProgram.description || 'Tidak ada deskripsi',
      }));
    }
    return [];
  }, [programsData]);

  const handleAddData = () => {
    setEditingProgram(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (program: Program) => {
    setEditingProgram(program);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (program: Program) => {
    setProgramToDelete(program);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (programToDelete) {
      try {
        await deleteProgram(programToDelete.id).unwrap();
        toast.success(`Program "${programToDelete.name}" berhasil dihapus.`);
      } catch (err) {
        const fetchError = err as FetchBaseQueryError;
        const errorMessage = (fetchError.data as { message?: string })?.message || 'Gagal menghapus program.';
        toast.error(errorMessage);
      } finally {
        setProgramToDelete(undefined);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingProgram(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingProgram(undefined);
  };

  const columns: ColumnDef<Program>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Nama Program',
      },
      {
        accessorKey: 'description',
        header: 'Deskripsi',
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const program = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(program)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteClick(program)}
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
        data={programs}
        exportFileName="data_program"
        exportTitle="Data Program Pendidikan"
        onAddData={handleAddData}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingProgram ? 'Edit Program' : 'Tambah Program Baru'}</DialogTitle>
            <DialogDescription>
              {editingProgram ? 'Ubah detail program ini.' : 'Isi detail untuk program baru.'}
            </DialogDescription>
          </DialogHeader>
          <ProgramForm
            initialData={editingProgram}
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
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus program{' '}
              <span className="font-semibold text-foreground">"{programToDelete?.name}"</span> secara permanen.
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

export default ProgramTable;