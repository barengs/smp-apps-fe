import React, { useMemo } from 'react';
import {
  ColumnDef,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import * as toast from '@/utils/toast';
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
import CoaForm from './CoaForm';
import { Badge } from '@/components/ui/badge';
import {
  useGetCoaQuery,
  useDeleteCoaMutation,
} from '@/store/slices/coaApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { DataTable } from '@/components/DataTable';
import { Coa } from '@/store/slices/coaApi';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';

const CoaTable: React.FC = () => {
  const { data: coaData, error, isLoading } = useGetCoaQuery();
  const [deleteCoa] = useDeleteCoaMutation();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCoa, setEditingCoa] = React.useState<Coa | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [coaToDelete, setCoaToDelete] = React.useState<Coa | undefined>(undefined);

  const coa: Coa[] = useMemo(() => {
    if (coaData?.data) {
      return coaData.data;
    }
    return [];
  }, [coaData]);

  const handleAddData = () => {
    setEditingCoa(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (coa: Coa) => {
    setEditingCoa(coa);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (coa: Coa) => {
    setCoaToDelete(coa);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (coaToDelete) {
      try {
        await deleteCoa(coaToDelete.coa_code).unwrap();
        toast.showSuccess(`COA "${coaToDelete.account_name}" berhasil dihapus.`);
      } catch (err) {
        const fetchError = err as FetchBaseQueryError;
        const errorMessage = (fetchError.data as { message?: string })?.message || 'Gagal menghapus COA.';
        toast.showError(errorMessage);
      } finally {
        setCoaToDelete(undefined);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingCoa(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingCoa(undefined);
  };

  const columns: ColumnDef<Coa>[] = useMemo(
    () => [
      {
        accessorKey: 'coa_code',
        header: 'Kode COA',
      },
      {
        accessorKey: 'account_name',
        header: 'Nama Akun',
      },
      {
        accessorKey: 'account_type',
        header: 'Tipe Akun',
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.original.account_type}
          </Badge>
        ),
      },
      {
        accessorKey: 'level',
        header: 'Level',
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.original.level}
          </Badge>
        ),
      },
      {
        accessorKey: 'is_postable',
        header: 'Dapat Diposting',
        cell: ({ row }) => (
          <Badge variant={row.original.is_postable === 1 ? 'success' : 'secondary'} className="text-xs">
            {row.original.is_postable === 1 ? 'Ya' : 'Tidak'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const coa = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(coa)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="outline"
                className="h-8 px-2 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleDeleteClick(coa)}
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

  if (isLoading) return <TableLoadingSkeleton numCols={6} />;
  if (error) {
    let errorMessage = 'Terjadi kesalahan saat memuat data.';
    if (typeof error === 'object' && error !== null) {
      if ('status' in error) {
        if (typeof (error as FetchBaseQueryError).status === 'number') {
          const fetchError = error as FetchBaseQueryError;
          if (fetchError.data && typeof fetchError.data === 'object' && 'message' in fetchError.data) {
            errorMessage = (fetchError.data as { message: string }).message;
          } else {
            errorMessage = `Error ${fetchError.status}: ${JSON.stringify(fetchError.data || {})}`;
          }
        } else if (typeof (error as FetchBaseQueryError).status === 'string') {
          if ('error' in error && typeof error.error === 'string') {
            errorMessage = error.error;
          } else {
            errorMessage = `Error: ${error.status} - ${JSON.stringify(error)}`;
          }
        } else {
          errorMessage = `Terjadi kesalahan: ${JSON.stringify(error)}`;
        }
      } else if ('message' in error && typeof (error as SerializedError).message === 'string') {
        errorMessage = error.message;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    toast.showError(errorMessage);
    return <div>Error: {errorMessage}</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={coa}
        exportFileName="data_coa"
        exportTitle="Data Chart of Account"
        onAddData={handleAddData}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCoa ? 'Edit COA' : 'Tambah COA Baru'}</DialogTitle>
            <DialogDescription>
              {editingCoa ? 'Ubah detail COA ini.' : 'Isi detail untuk COA baru.'}
            </DialogDescription>
          </DialogHeader>
          <CoaForm
            initialData={editingCoa}
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
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus COA{' '}
              <span className="font-semibold text-foreground">"{coaToDelete?.account_name}"</span> secara permanen.
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

export default CoaTable;