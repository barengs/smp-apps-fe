import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from './DataTable'; // Import the new DataTable component

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
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
                onClick={() => toast.info(`Mengedit staf: ${staff.name}`)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => toast.error(`Menghapus staf: ${staff.name}`)}
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
    toast.info('Membuka form tambah data staf...');
    // Implementasi logika untuk membuka form tambah data
  };

  return (
    <DataTable
      columns={columns}
      data={dummyStaffData}
      exportFileName="data_staf"
      exportTitle="Data Staf Pesantren"
      onAddData={handleAddData}
    />
  );
};

export default StaffTable;