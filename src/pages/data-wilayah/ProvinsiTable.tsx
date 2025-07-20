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
import ProvinsiForm from './ProvinsiForm.tsx';
import { useGetProvincesQuery, useDeleteProvinceMutation } from '@/store/slices/provinceApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';

interface Provinsi {
  id: number;
  code: string;
  name: string;
}

const ProvinsiTable: React.FC = () => {
  const { data: provincesData, error, isLoading } = useGetProvincesQuery();
  const [deleteProvince] = useDeleteProvinceMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvinsi, setEditingProvinsi] = useState<Provinsi | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [provinsiToDelete, setProvinsiToDelete] = useState<Provinsi | undefined>(undefined);

  // Data is now a direct array, no need to access .data
  const provinces: Provinsi[] = useMemo(() => {
    return provincesData || [];
  }, [provincesData]);

  const handleAddData = () => {
    setEditingProvinsi(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (provinsi: Provinsi) => {
    setEditingProvinsi(provinsi);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (provinsi: Provinsi) => {
    setProvinsiToDelete(provinsi);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (provinsiToDelete) {
      try {
        await deleteProvince(provinsiToDelete.id).unwrap();
        toast.success(`Provinsi "${provinsiToDelete.name}" berhasil dihapus.`);
      } catch (err) {
        const fetchError = err as FetchBaseQueryError;
        const errorMessage = (fetchError.data as { message?: string })?.message || 'Gagal menghapus provinsi.';
        toast.error(errorMessage);
      } finally {
        setProvinsiToDelete(undefined);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingProvinsi(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingProvinsi(undefined);
  };

  const columns: ColumnDef<Provinsi>[] = useMemo(
    () => [
      {
        accessorKey: 'code',
        header: 'Kode',
      },
      {
        accessorKey: 'name',
        header: 'Nama Provinsi',
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const provinsi = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(provinsi)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteClick(provinsi)}
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
        data={provinces}
        exportFileName="data_provinsi"
        exportTitle="Data Provinsi"
        onAddData={handleAddData}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingProvinsi ? 'Edit Provinsi' : 'Tambah Provinsi Baru'}</DialogTitle>
            <DialogDescription>
              {editingProvinsi ? 'Ubah detail provinsi ini.' : 'Isi detail untuk provinsi baru.'}
            </DialogDescription>
          </DialogHeader>
          <ProvinsiForm
            initialData={editingProvinsi}
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
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus provinsi{' '}
              <span className="font-semibold text-foreground">"{provinsiToDelete?.name}"</span> secara permanen.
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

export default ProvinsiTable;