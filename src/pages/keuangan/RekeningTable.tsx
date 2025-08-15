import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/DataTable';
import { Account } from '@/types/keuangan';
import { Badge } from '@/components/ui/badge';

interface RekeningTableProps {
  data: Account[];
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'inactive':
      return 'secondary';
    case 'frozen':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const RekeningTable: React.FC<RekeningTableProps> = ({ data, onEdit, onDelete }) => {
  const columns: ColumnDef<Account>[] = [
    {
      accessorKey: 'account_number',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          No. Rekening
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorFn: (row) => row.santri.nama, // FIX: Use accessorFn for nested property
      header: 'Pemilik Rekening',
    },
    {
      accessorFn: (row) => row.produk.name, // FIX: Use accessorFn for nested property
      header: 'Produk',
    },
    {
      accessorKey: 'balance',
      header: () => <div className="text-right">Saldo</div>,
      cell: ({ row }) => {
        const amount = parseFloat(String(row.getValue('balance')));
        const formatted = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
        }).format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const account = row.original;
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
              <DropdownMenuItem onClick={() => onEdit(account)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(account)} className="text-destructive">
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={data} filterKeys={['account_number']} />;
};