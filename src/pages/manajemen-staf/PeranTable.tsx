import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ChevronDown } from 'lucide-react';
import * as toast from '@/utils/toast';
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
import PeranForm from './PeranForm';
import { Badge } from '@/components/ui/badge';
import {
  useGetRolesQuery,
  useDeleteRoleMutation,
} from '../../store/slices/roleApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Peran {
  id: number;
  roleName: string;
  description: string;
  usersCount: number;
  accessRights: string[];
}

const PeranTable: React.FC = () => {
  const { data: rolesData, error, isLoading } = useGetRolesQuery();
  const [deleteRole] = useDeleteRoleMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeran, setEditingPeran] = useState<Peran | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [peranToDelete, setPeranToDelete] = useState<Peran | undefined>(undefined);

  const roles: Peran[] = useMemo(() => {
    if (rolesData?.data) {
      return rolesData.data.map(apiRole => ({
        id: apiRole.id,
        roleName: apiRole.name,
        description: '', // API does not provide description, so set to empty
        usersCount: 0, // API does not provide usersCount, so set to 0
        accessRights: apiRole.permissions?.map(p => p.name) || [], // Map permissions to accessRights
      }));
    }
    return [];
  }, [rolesData]);

  const handleAddData = () => {
    setEditingPeran(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (peran: Peran) => {
    setEditingPeran(peran);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (peran: Peran) => {
    setPeranToDelete(peran);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (peranToDelete) {
      try {
        await deleteRole(peranToDelete.id).unwrap();
        toast.showSuccess(`Peran "${peranToDelete.roleName}" berhasil dihapus.`);
        setPeranToDelete(undefined);
        setIsDeleteDialogOpen(false);
      } catch (err: any) {
        let errorMessage = 'Terjadi kesalahan tidak dikenal.';
        if (typeof err === 'object' && err !== null) {
          if ('data' in err && err.data && typeof err.data === 'object' && 'message' in err.data) {
            errorMessage = (err.data as { message: string }).message;
          } else if ('error' in err && typeof err.error === 'string') {
            errorMessage = err.error;
          } else if ('message' in err && typeof err.message === 'string') {
            errorMessage = err.message;
          }
        }
        toast.showError(`Gagal menghapus peran: ${errorMessage}`);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingPeran(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingPeran(undefined);
  };

  const columns: ColumnDef<Peran>[] = useMemo(
    () => [
      {
        accessorKey: 'roleName',
        header: 'Nama Peran',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'description',
        header: 'Deskripsi',
        cell: (info) => info.getValue() || '-',
      },
      {
        accessorKey: 'accessRights',
        header: 'Hak Akses',
        cell: ({ row }) => {
          const rights = row.original.accessRights;
          if (!rights || rights.length === 0) {
            return <span className="text-muted-foreground">-</span>;
          }

          if (rights.length === 1) {
            return <Badge variant="outline">{rights[0]}</Badge>;
          }

          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {rights.length} Hak Akses
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <div className="space-y-1">
                  {rights.map((right, index) => (
                    <Badge key={index} variant="secondary" className="block w-full text-left font-normal whitespace-normal">
                      {right}
                    </Badge>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          );
        },
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const peran = row.original;
          const isProtectedRole = peran.roleName === 'superadmin' || peran.roleName === 'orangtua';
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(peran)}
                disabled={isProtectedRole}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="danger"
                className="h-8 px-2 text-xs"
                onClick={() => handleDeleteClick(peran)}
                disabled={isProtectedRole}
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

  if (isLoading) return <TableLoadingSkeleton numCols={4} />;
  if (error) {
    let errorMessage = 'Terjadi kesalahan saat memuat data.';
    if (typeof error === 'object' && error !== null) {
      if ('status' in error) {
        if (typeof (error as FetchBaseQueryError).data === 'object' && (error as FetchBaseQueryError).data !== null && 'message' in ((error as FetchBaseQueryError).data as object)) {
          errorMessage = ((error as FetchBaseQueryError).data as { message: string }).message;
        } else {
          errorMessage = `Error ${(error as FetchBaseQueryError).status}: ${JSON.stringify((error as FetchBaseQueryError).data)}`;
        }
      } else if ('message' in error) {
        errorMessage = (error as { message: string }).message;
      }
    }
    return <div>Error: {errorMessage}</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={roles}
        exportFileName="data_peran"
        exportTitle="Data Peran Pengguna"
        onAddData={handleAddData}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingPeran ? 'Edit Peran' : 'Tambah Peran Baru'}</DialogTitle>
            <DialogDescription>
              {editingPeran ? 'Ubah detail peran ini.' : 'Isi detail untuk peran baru.'}
            </DialogDescription>
          </DialogHeader>
          <PeranForm
            initialData={editingPeran}
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
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus peran{' '}
              <span className="font-semibold text-foreground">"{peranToDelete?.roleName}"</span> secara permanen.
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

export default PeranTable;