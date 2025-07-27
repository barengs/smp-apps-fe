import React, { useState } from 'react';
import { useGetStudiesQuery, useDeleteStudyMutation } from '@/store/slices/studyApi';
import { MataPelajaran } from '@/types/pendidikan';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import MataPelajaranForm from './MataPelajaranForm';
import * as toast from '@/utils/toast'; // Perbaikan di sini
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';

const MataPelajaranTable: React.FC = () => {
  const { data: studies, isLoading, isError, refetch } = useGetStudiesQuery();
  const [deleteStudy] = useDeleteStudyMutation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState<MataPelajaran | undefined>(undefined);

  const handleDelete = async (id: string) => {
    try {
      await deleteStudy(id).unwrap();
      toast.showSuccess('Mata pelajaran berhasil dihapus!');
      refetch();
    } catch (error) {
      toast.showError('Gagal menghapus mata pelajaran.');
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    refetch();
  };

  const columns: ColumnDef<MataPelajaran>[] = [
    {
      accessorKey: 'name',
      header: 'Nama Mata Pelajaran',
    },
    {
      accessorKey: 'description',
      header: 'Deskripsi',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const study = row.original;
        return (
          <div className="text-right">
            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Buka menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedStudy(study);
                      setIsFormOpen(true);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem>
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Hapus</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Ini akan menghapus mata pelajaran secara permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(study.id)}>
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return <TableLoadingSkeleton />;
  }

  if (isError) {
    return <div className="text-center text-red-500">Gagal memuat data. Silakan coba lagi.</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedStudy(undefined)}>Tambah Mata Pelajaran</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedStudy ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}</DialogTitle>
            </DialogHeader>
            <MataPelajaranForm onSuccess={handleFormSuccess} initialData={selectedStudy} />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable
        columns={columns}
        data={studies || []}
        exportFileName="DaftarMataPelajaran"
        exportTitle="Daftar Mata Pelajaran"
      />
    </div>
  );
};

export default MataPelajaranTable;