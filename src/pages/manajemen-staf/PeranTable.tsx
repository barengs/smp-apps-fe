import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '../../components/DataTable';

interface Peran {
  id: string;
  roleName: string;
  description: string;
  usersCount: number;
}

const dummyPeranData: Peran[] = [
  { id: 'P001', roleName: 'Administrasi', description: 'Mengelola seluruh sistem pesantren.', usersCount: 3 },
  { id: 'P002', roleName: 'Guru', description: 'Mengajar dan mengelola nilai serta absensi santri.', usersCount: 25 },
  { id: 'P003', roleName: 'Wali Santri', description: 'Memantau perkembangan santri dan berkomunikasi dengan pesantren.', usersCount: 500 },
  { id: 'P004', roleName: 'Bendahara', description: 'Mengelola keuangan pesantren.', usersCount: 2 },
  { id: 'P005', roleName: 'Pustakawan', description: 'Mengelola perpustakaan pesantren.', usersCount: 1 },
  { id: 'P006', roleName: 'Keamanan', description: 'Menjaga keamanan lingkungan pesantren.', usersCount: 5 },
];

const PeranTable: React.FC = () => {
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
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const peran = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => toast.info(`Mengedit peran: ${peran.roleName}`)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => toast.error(`Menghapus peran: ${peran.roleName}`)}
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
    toast.info('Membuka form tambah peran...');
    // Implementasi logika untuk membuka form tambah data peran
  };

  return (
    <DataTable
      columns={columns}
      data={dummyPeranData}
      exportFileName="data_peran"
      exportTitle="Data Peran Pengguna"
      onAddData={handleAddData}
    />
  );
};

export default PeranTable;