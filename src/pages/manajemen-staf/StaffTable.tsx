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
import StaffForm from './StaffForm'; // Import the new form component

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Aktif' | 'Cuti' | 'Tidak Aktif'; // Perbaikan: Menggunakan tipe literal union
}

const dummyStaffData: Staff[] = [
  { id: '1', name: 'Budi Santoso', email: 'budi.s@pesantren.com', role: 'Guru Fiqih', status: 'Aktif' },
  { id: '2', name: 'Siti Aminah', email: 'siti.a@pesantren.com', role: 'Administrasi', status: 'Aktif' },
  { id: '3', name: 'Ahmad Fauzi', email: 'ahmad.f@pesantren.com', role: 'Guru Tahfidz', status: 'Aktif' },
  { id: '4', name: 'Dewi Lestari', email: 'dewi.l@pesantren.com', role: 'Bendahara', status: 'Aktif' },
  { id: '5', name: 'Joko Susilo', email: 'joko.s@pesantren.com', role: 'Guru Bahasa Arab', status: 'Aktif' },
  { id: '6', name: 'Nurul Huda', email: 'nurul.h@pesantren.com', role: 'Guru Hadits', status: 'Aktif' },
  { id: '7', name: 'Rina Wijaya', email: 'rina.w@pesantren.com', role: 'Pustakawan', status: 'Aktif' },
  { id: '8', name: 'Faisal Rahman', email: 'faisal.r@pesantren.com', role: 'Keamanan', status: 'Aktif' },
  { id: '9', name: 'Linda Sari', email: 'linda.s@pesantren.com', role: 'Guru Matematika', status: 'Cuti' },
  { id: '10', name: 'Hasan Basri', email: 'hasan.b@pesantren.com', role: 'Guru Sejarah Islam', status: 'Aktif' },
];

const StaffTable: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | undefined>(undefined);

  const handleAddData = () => {
    setEditingStaff(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (staff: Staff) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (staff: Staff) => {
    setStaffToDelete(staff);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (staffToDelete) {
      toast.success(`Staf "${staffToDelete.name}" berhasil dihapus.`);
      // In a real app, you would perform the actual delete operation here
      // and then refetch data or update state.
      setStaffToDelete(undefined);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingStaff(undefined);
    // In a real app, you would refetch data here
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingStaff(undefined);
  };

  const columns: ColumnDef<Staff>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Nama',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'role',
        header: 'Peran',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => info.getValue(),
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const staff = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(staff)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteClick(staff)}
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
        data={dummyStaffData}
        exportFileName="data_staf"
        exportTitle="Data Staf Pesantren"
        onAddData={handleAddData}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingStaff ? 'Edit Staf' : 'Tambah Staf Baru'}</DialogTitle>
            <DialogDescription>
              {editingStaff ? 'Ubah detail staf ini.' : 'Isi detail untuk staf baru.'}
            </DialogDescription>
          </DialogHeader>
          <StaffForm
            initialData={editingStaff}
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
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus staf{' '}
              <span className="font-semibold text-foreground">"{staffToDelete?.name}"</span> secara permanen.
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

export default StaffTable;