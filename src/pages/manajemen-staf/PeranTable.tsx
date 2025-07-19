import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
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
import PeranForm from './PeranForm';
import { Badge } from '@/components/ui/badge';
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from '@/store/apiSlice'; // Import RTK Query hooks
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

interface Peran {
  id: number; // Changed to number to match API
  roleName: string; // Corresponds to 'name' in API
  description: string; // Not directly from API, will be empty/default
  usersCount: number; // Not directly from API, will be 0
  accessRights: string[]; // Not directly from API, will be empty
}

// dummyPeranData dikembalikan dan diekspor untuk digunakan oleh HakAksesForm
export const dummyPeranData: Peran[] = [
  { id: 1, roleName: 'Administrasi', description: 'Mengelola seluruh sistem pesantren.', usersCount: 3, accessRights: ['Full Access', 'Manage Users', 'Manage Settings'] },
  { id: 2, roleName: 'Guru', description: 'Mengajar dan mengelola nilai serta absensi santri.', usersCount: 25, accessRights: ['View Pelajaran', 'Edit Nilai', 'Manage Absensi'] },
  { id: 3, roleName: 'Wali Santri', description: 'Memantau perkembangan santri dan berkomunikasi dengan pesantren.', usersCount: 500, accessRights: ['View Santri Info', 'View Absensi', 'View Nilai'] },
  { id: 4, roleName: 'Bendahara', description: 'Mengelola keuangan pesantren.', usersCount: 2, accessRights: ['Manage Keuangan', 'View Laporan'] },
  { id: 5, roleName: 'Pustakawan', description: 'Mengelola perpustakaan pesantren.', usersCount: 1, accessRights: ['Manage Buku', 'Manage Peminjaman'] },
  { id: 6, roleName: 'Keamanan', description: 'Menjaga keamanan lingkungan pesantren.', usersCount: 5, accessRights: ['View Log Keamanan', 'Manage Akses Area'] },
];


const PeranTable: React.FC = () => {
  const { data: rolesData, error, isLoading } = useGetRolesQuery(); // Fetch data
  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeran, setEditingPeran] = useState<Peran | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [peranToDelete, setPeranToDelete] = useState<Peran | undefined>(undefined);

  // Map API data to frontend Peran interface
  const roles: Peran[] = useMemo(() => {
    if (rolesData?.data) {
      return rolesData.data.map(apiRole => ({
        id: apiRole.id,
        roleName: apiRole.name,
        description: '', // API does not provide description, so set to empty
        usersCount: 0, // API does not provide usersCount, so set to 0
        accessRights: [], // API does not provide accessRights, so set to empty array
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
        toast.success(`Peran "${peranToDelete.roleName}" berhasil dihapus.`);
        setPeranToDelete(undefined);
        setIsDeleteDialogOpen(false);
        // RTK Query's invalidatesTags will automatically refetch getRoles
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
        toast.error(`Gagal menghapus peran: ${errorMessage}`);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingPeran(undefined);
    // RTK Query's invalidatesTags will automatically refetch getRoles
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
        cell: (info) => info.getValue(),
      },
      // Kolom 'Jumlah Pengguna' dihapus
      {
        accessorKey: 'accessRights',
        header: 'Hak Akses',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.accessRights.map((right) => (
              <Badge key={right} variant="outline" className="text-xs">
                {right}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const peran = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(peran)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteClick(peran)}
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

  if (isLoading) return <div>Memuat data peran...</div>;
  if (error) {
    let errorMessage = 'Terjadi kesalahan saat memuat data.';
    if (typeof error === 'object' && error !== null) {
      if ('status' in error) {
        // It's a FetchBaseQueryError
        if (typeof error.data === 'object' && error.data !== null && 'message' in error.data) {
          errorMessage = (error.data as { message: string }).message;
        } else {
          errorMessage = `Error ${error.status}: ${JSON.stringify(error.data)}`;
        }
      } else if ('message' in error) {
        // It's a SerializedError
        errorMessage = error.message;
      }
    }
    return <div>Error: {errorMessage}</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={roles} // Use fetched data
        exportFileName="data_peran"
        exportTitle="Data Peran Pengguna"
        onAddData={handleAddData}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
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