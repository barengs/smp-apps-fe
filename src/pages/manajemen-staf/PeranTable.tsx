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
import PeranForm from './PeranForm'; // Import the new form component
import { Badge } from '@/components/ui/badge'; // Import Badge component

interface Peran {
  id: string;
  roleName: string;
  description: string;
  usersCount: number;
  accessRights: string[]; // New field for access rights
}

const dummyPeranData: Peran[] = [
  { id: 'P001', roleName: 'Administrasi', description: 'Mengelola seluruh sistem pesantren.', usersCount: 3, accessRights: ['Full Access', 'Manage Users', 'Manage Settings'] },
  { id: 'P002', roleName: 'Guru', description: 'Mengajar dan mengelola nilai serta absensi santri.', usersCount: 25, accessRights: ['View Pelajaran', 'Edit Nilai', 'Manage Absensi'] },
  { id: 'P003', roleName: 'Wali Santri', description: 'Memantau perkembangan santri dan berkomunikasi dengan pesantren.', usersCount: 500, accessRights: ['View Santri Info', 'View Absensi', 'View Nilai'] },
  { id: 'P004', roleName: 'Bendahara', description: 'Mengelola keuangan pesantren.', usersCount: 2, accessRights: ['Manage Keuangan', 'View Laporan'] },
  { id: 'P005', roleName: 'Pustakawan', description: 'Mengelola perpustakaan pesantren.', usersCount: 1, accessRights: ['Manage Buku', 'Manage Peminjaman'] },
  { id: 'P006', roleName: 'Keamanan', description: 'Menjaga keamanan lingkungan pesantren.', usersCount: 5, accessRights: ['View Log Keamanan', 'Manage Akses Area'] },
];

const PeranTable: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeran, setEditingPeran] = useState<Peran | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [peranToDelete, setPeranToDelete] = useState<Peran | undefined>(undefined);

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

  const handleConfirmDelete = () => {
    if (peranToDelete) {
      toast.success(`Peran "${peranToDelete.roleName}" berhasil dihapus.`);
      // In a real app, you would perform the actual delete operation here
      // and then refetch data or update state.
      setPeranToDelete(undefined);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingPeran(undefined);
    // In a real app, you would refetch data here
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
      {
        accessorKey: 'usersCount',
        header: 'Jumlah Pengguna',
        cell: (info) => info.getValue(),
      },
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

  return (
    <>
      <DataTable
        columns={columns}
        data={dummyPeranData}
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