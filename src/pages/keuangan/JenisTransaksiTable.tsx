import React from 'react';
import { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import { TransactionType } from '@/types/keuangan';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

interface JenisTransaksiTableProps {
  data: TransactionType[];
  onEdit: (transactionType: TransactionType) => void;
  onDelete: (id: number) => void;
  pagination: PaginationState;
  onPaginationChange: (updater: PaginationState) => void;
  pageCount: number;
  sorting: SortingState;
  onSortingChange: (updater: SortingState) => void;
}

export const JenisTransaksiTable: React.FC<JenisTransaksiTableProps> = ({ data, onEdit, onDelete, pagination, onPaginationChange, pageCount, sorting, onSortingChange }) => {

  const columns: ColumnDef<TransactionType>[] = [
    {
      accessorKey: 'name',
      header: 'Nama Jenis Transaksi',
    },
    {
      accessorKey: 'description',
      header: 'Deskripsi',
      cell: ({ row }) => row.original.description || '-',
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.original.is_active;
        return (
          <Badge variant={isActive ? 'success' : 'destructive'}>
            {isActive ? 'Aktif' : 'Tidak Aktif'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const transactionType = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
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

  return (
    <DataTable
      columns={columns}
      data={data}
      exportFileName="data_jenis_transaksi"
      exportTitle="Data Jenis Transaksi"
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      pageCount={pageCount}
      sorting={sorting}
      onSortingChange={onSortingChange}
    />
  );
};