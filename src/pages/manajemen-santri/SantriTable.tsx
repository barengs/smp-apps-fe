import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '../../components/DataTable'; // Corrected import path

interface Santri {
  id: string;
  name: string;
  nis: string; // Nomor Induk Santri
  class: string;
  dormitory: string; // Kolom baru: Asrama
  status: string;
}

const dummySantriData: Santri[] = [
  { id: 'S001', name: 'Fatimah Az-Zahra', nis: '2023001', class: 'VII A', dormitory: 'Putri A', status: 'Aktif' },
  { id: 'S002', name: 'Muhammad Al-Fatih', nis: '2023002', class: 'VII B', dormitory: 'Putra B', status: 'Aktif' },
  { id: 'S003', name: 'Aisyah Humaira', nis: '2023003', class: 'VIII A', dormitory: 'Putri C', status: 'Aktif' },
  { id: 'S004', name: 'Abdullah bin Umar', nis: '2023004', class: 'VIII B', dormitory: 'Putra A', status: 'Aktif' },
  { id: 'S005', name: 'Khadijah Kubra', nis: '2023005', class: 'IX A', dormitory: 'Putri B', status: 'Aktif' },
  { id: 'S006', name: 'Ali bin Abi Thalib', nis: '2023006', class: 'IX B', dormitory: 'Putra C', status: 'Aktif' },
  { id: 'S007', name: 'Zainab binti Muhammad', nis: '2023007', class: 'X IPA', dormitory: 'Putri A', status: 'Aktif' },
  { id: 'S008', name: 'Umar bin Khattab', nis: '2023008', class: 'X IPS', dormitory: 'Putra B', status: 'Aktif' },
  { id: 'S009', name: 'Ruqayyah binti Muhammad', nis: '2023009', class: 'XI IPA', dormitory: 'Putri C', status: 'Cuti' },
  { id: 'S010', name: 'Utsman bin Affan', nis: '2023010', class: 'XI IPS', dormitory: 'Putra A', status: 'Aktif' },
];

const SantriTable: React.FC = () => {
  const columns: ColumnDef<Santri>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Nama',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'nis',
        header: 'NIS',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'class',
        header: 'Kelas',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'dormitory',
        header: 'Asrama',
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
          const santri = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => toast.info(`Mengedit santri: ${santri.name}`)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  const handleAddData = () => {
    toast.info('Membuka form tambah data santri...');
    // Implementasi logika untuk membuka form tambah data santri
  };

  return (
    <DataTable
      columns={columns}
      data={dummySantriData}
      exportFileName="data_santri"
      exportTitle="Data Santri Pesantren"
      onAddData={handleAddData}
    />
  );
};

export default SantriTable;