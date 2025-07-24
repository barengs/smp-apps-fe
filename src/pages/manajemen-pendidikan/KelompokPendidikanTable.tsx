import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/DataTable';
import { useGetEducationClassesQuery } from '@/store/slices/educationClassApi';
import { KelompokPendidikan } from '@/types/pendidikan';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import * as toast from '@/utils/toast';

interface KelompokPendidikanTableProps {
  onAddData: () => void;
  onEditData: (data: KelompokPendidikan) => void;
}

export const KelompokPendidikanTable: React.FC<KelompokPendidikanTableProps> = ({ onAddData, onEditData }) => {
  const { data, isLoading, isError, error } = useGetEducationClassesQuery();

  // Tambahkan console log untuk debugging
  console.log("KelompokPendidikanTable - data:", data);
  console.log("KelompokPendidikanTable - isLoading:", isLoading);
  console.log("KelompokPendidikanTable - isError:", isError);
  if (isError) {
    console.error("KelompokPendidikanTable - error details:", error);
  }

  const columns: ColumnDef<KelompokPendidikan>[] = [
    {
      accessorKey: 'code',
      header: 'Kode',
    },
    {
      accessorKey: 'name',
      header: 'Nama Kelompok Pendidikan',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const kelompok = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditData(kelompok)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => toast.showWarning('Fitur hapus belum tersedia.')}>
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Hapus</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return <TableLoadingSkeleton />;
  }

  if (isError) {
    return <div className="text-center text-red-500">Gagal memuat data. Silakan coba lagi nanti.</div>;
  }

  // Tambahkan pesan jika data kosong
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500">Tidak ada data kelompok pendidikan yang tersedia.</div>;
  }

  return (
    <DataTable
      columns={columns}
      data={data ?? []}
      exportFileName="kelompok_pendidikan"
      exportTitle="Data Kelompok Pendidikan"
      onAddData={onAddData}
    />
  );
};

export default KelompokPendidikanTable;