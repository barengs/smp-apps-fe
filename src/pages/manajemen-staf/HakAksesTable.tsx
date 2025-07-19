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
  DialogTrigger,
} from '@/components/ui/dialog';
import HakAksesForm from './HakAksesForm'; // Import the new form component

interface HakAkses {
  id: string;
  roleName: string;
  permission: string;
  description: string;
}

const dummyHakAksesData: HakAkses[] = [
  { id: 'HA001', roleName: 'Administrasi', permission: 'Full Access', description: 'Akses penuh ke semua modul manajemen.' },
  { id: 'HA002', roleName: 'Guru', permission: 'View & Edit Pelajaran, Nilai', description: 'Melihat dan mengedit data pelajaran dan nilai santri.' },
  { id: 'HA003', roleName: 'Wali Santri', permission: 'View Santri Info, Absensi, Nilai', description: 'Melihat informasi santri, absensi, dan nilai anak.' },
  { id: 'HA004', roleName: 'Bendahara', permission: 'Manage Keuangan', description: 'Mengelola data keuangan dan pembayaran.' },
  { id: 'HA005', roleName: 'Pustakawan', permission: 'Manage Buku', description: 'Mengelola inventaris buku dan peminjaman.' },
];

const HakAksesTable: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHakAkses, setEditingHakAkses] = useState<HakAkses | undefined>(undefined);

  const handleAddData = () => {
    setEditingHakAkses(undefined); // Clear any previous editing data
    setIsModalOpen(true);
  };

  const handleEditData = (hakAkses: HakAkses) => {
    setEditingHakAkses(hakAkses);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingHakAkses(undefined);
    // In a real app, you would refetch data here
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingHakAkses(undefined);
  };

  const columns: ColumnDef<HakAkses>[] = useMemo(
    () => [
      {
        accessorKey: 'roleName',
        header: 'Nama Peran',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'permission',
        header: 'Hak Akses',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'description',
        header: 'Deskripsi',
        cell: (info) => info.getValue(),
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const hakAkses = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(hakAkses)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => toast.error(`Menghapus hak akses untuk: ${hakAkses.roleName}`)}
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
        data={dummyHakAksesData}
        exportFileName="data_hak_akses"
        exportTitle="Data Hak Akses Pengguna"
        onAddData={handleAddData}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]"> {/* Make modal wider */}
          <DialogHeader>
            <DialogTitle>{editingHakAkses ? 'Edit Hak Akses' : 'Tambah Hak Akses Baru'}</DialogTitle>
            <DialogDescription>
              {editingHakAkses ? 'Ubah detail hak akses ini.' : 'Isi detail untuk hak akses baru.'}
            </DialogDescription>
          </DialogHeader>
          <HakAksesForm
            initialData={editingHakAkses}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HakAksesTable;