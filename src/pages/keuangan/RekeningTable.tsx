import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import { Account } from '@/types/keuangan';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RekeningTableProps {
  data: Account[];
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  onViewDetails: (account: Account) => void;
}

export const RekeningTable: React.FC<RekeningTableProps> = ({ data, onEdit, onDelete, onViewDetails }) => {
  const navigate = useNavigate();

  const columns: ColumnDef<Account>[] = [
    {
      accessorKey: 'account_number',
      header: 'Nomor Rekening',
    },
    {
      accessorKey: 'customer',
      header: 'Nama Santri',
      cell: ({ row }) => {
        const customer = row.original.customer;
        return customer ? `${customer.first_name} ${customer.last_name || ''}` : '-';
      },
    },
    {
      accessorKey: 'product',
      header: 'Produk',
      cell: ({ row }) => {
        const product = row.original.product;
        return product ? product.product_name : '-';
      },
    },
    {
      accessorKey: 'balance',
      header: 'Saldo',
      cell: ({ row }) => {
        const balance = parseFloat(row.original.balance);
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
        }).format(balance);
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={status === 'ACTIVE' ? 'success' : 'destructive'}>
            {status}
          </Badge>
        );
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
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewDetails(account)}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(account)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(account)} className="text-red-600">
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleRowClick = (account: Account) => {
    navigate(`/keuangan/rekening/${account.account_number}`);
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      exportFileName="data_rekening"
      exportTitle="Data Rekening"
      onRowClick={handleRowClick}
    />
  );
};