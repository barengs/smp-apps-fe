import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import { Account, AccountApiResponse } from '@/types/keuangan';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { useGetAccountsQuery } from '@/store/slices/accountApi';
import { useNavigate } from 'react-router-dom';

interface RekeningTableProps {
  data: Account[];
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  onViewDetails: (account: Account) => void;
}

export const RekeningTable: React.FC<RekeningTableProps> = ({ data, onEdit, onDelete, onViewDetails }) => {
  const navigate = useNavigate();

  const handleAddData = () => {
    navigate('/dashboard/keuangan/rekening/tambah');
  };

  const columns: ColumnDef<Account>[] = [
    {
      accessorKey: 'account_number',
      header: 'Nomor Rekening',
    },
    {
      accessorKey: 'account_name',
      header: 'Nama Rekening',
    },
    {
      accessorKey: 'account_type',
      header: 'Jenis Rekening',
    },
    {
      accessorKey: 'balance',
      header: 'Saldo',
      cell: ({ row }) => {
        const balance = parseFloat(row.original.balance); // Convert string to number
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
        }).format(balance);
      },
    },
    {
      accessorKey: 'status', // Change accessorKey from 'is_active' to 'status'
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status; // Get the string status
        const isActive = status === 'ACTIVE'; // Determine if active based on status string
        return (
          <Badge variant={isActive ? 'default' : 'destructive'}>
            {status} {/* Display the actual status string */}
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
              <DropdownMenuItem onClick={() => onViewDetails(account)}>Lihat Detail</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(account)}>Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(account)} className="text-destructive">
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
      exportFileName="data_rekening"
      exportTitle="Data Rekening"
      onAddData={handleAddData}
      addButtonLabel="Tambah Rekening"
    />
  );
};