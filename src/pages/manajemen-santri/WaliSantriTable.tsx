import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '../../components/DataTable'; // Corrected import path

interface WaliSantri {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  relatedSantri: string; // Santri yang diwakili
  status: string;
}

const dummyWaliSantriData: WaliSantri[] = [
  { id: 'W001', name: 'Bapak Joko', email: 'joko.wali@example.com', phone: '081234567890', address: 'Jl. Merdeka No. 10', relatedSantri: 'Fatimah Az-Zahra', status: 'Aktif' },
  { id: 'W002', name: 'Ibu Ani', email: 'ani.wali@example.com', phone: '081298765432', address: 'Jl. Pahlawan No. 25', relatedSantri: 'Muhammad Al-Fatih', status: 'Aktif' },
  { id: 'W003', name: 'Bapak Budi', email: 'budi.wali@example.com', phone: '085678901234', address: 'Jl. Sudirman No. 5', relatedSantri: 'Aisyah Humaira', status: 'Aktif' },
  { id: 'W004', name: 'Ibu Siti', email: 'siti.wali@example.com', phone: '087812345678', address: 'Jl. Diponegoro No. 12', relatedSantri: 'Abdullah bin Umar', status: 'Aktif' },
  { id: 'W005', name: 'Bapak Ahmad', email: 'ahmad.wali@example.com', phone: '081345678901', address: 'Jl. Gajah Mada No. 30', relatedSantri: 'Khadijah Kubra', status: 'Tidak Aktif' },
  { id: 'W006', name: 'Ibu Nurul', email: 'nurul.wali@example.com', phone: '081122334455', address: 'Jl. Kartini No. 8', relatedSantri: 'Ali bin Abi Thalib', status: 'Aktif' },
];

const WaliSantriTable: React.FC = () => {
  const columns: ColumnDef<WaliSantri>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Nama Wali',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'phone',
        header: 'Telepon',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'address',
        header: 'Alamat',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'relatedSantri',
        header: 'Santri Terkait',
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
          const waliSantri = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => toast.info(`Mengedit wali santri: ${waliSantri.name}`)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => toast.error(`Menghapus wali santri: ${waliSantri.name}`)}
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
    toast.info('Membuka form tambah data wali santri...');
    // Implementasi logika untuk membuka form tambah data wali santri
  };

  return (
    <DataTable
      columns={columns}
      data={dummyWaliSantriData}
      exportFileName="data_wali_santri"
      exportTitle="Data Wali Santri Pesantren"
      onAddData={handleAddData}
    />
  );
};

export default WaliSantriTable;