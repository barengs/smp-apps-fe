import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/DataTable';
import { TransactionType } from '@/types/keuangan';
import { Checkbox } from '@/components/ui/checkbox';

interface JenisTransaksiTableProps {
  data: TransactionType[];
  onEdit: (transactionType: TransactionType) => void;
  onDelete: (id: number) => void;
}

export const JenisTransaksiTable: React.FC<JenisTransaksiTableProps> = ({ data, onEdit, onDelete }) => {
  const columns: ColumnDef<TransactionType>[] = [
    {
      accessorKey: 'code',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Kode
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Nama',
    },
    {
      accessorKey: 'category',
      header: 'Kategori',
    },
    {
      accessorKey: 'is_debit',
      header: 'Debit',
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Checkbox checked={row.original.is_debit} disabled />
        </div>
      ),
    },
    {
      accessorKey: 'is_credit',
      header: 'Kredit',
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Checkbox checked={row.original.is_credit} disabled />
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const transactionType = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(transactionType)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(transactionType.id)} className="text-red-600">
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={data} exportFileName="JenisTransaksi" exportTitle="Daftar Jenis Transaksi" />;
};