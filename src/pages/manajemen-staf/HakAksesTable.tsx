import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '../../components/DataTable';

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
                onClick={() => toast.info(`Mengedit hak akses untuk: ${hakAkses.roleName}`)}
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

  const handleAddData = () => {
    toast.info('Membuka form tambah hak akses...');
    // Implementasi logika untuk membuka form tambah data hak akses
  };

  return (
    <DataTable
      columns={columns}
      data={dummyHakAksesData}
      exportFileName="data_hak_akses"
      exportTitle="Data Hak Akses Pengguna"
      onAddData={handleAddData}
    />
  );
};

export default HakAksesTable;