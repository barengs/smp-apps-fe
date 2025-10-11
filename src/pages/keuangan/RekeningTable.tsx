import React from 'react';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Account } from '@/types/keuangan';
import { ColumnDef } from '@tanstack/react-table';

interface RekeningTableProps {
  data: Account[];
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  onViewDetails: (account: Account) => void;
}

export const RekeningTable: React.FC<RekeningTableProps> = ({ data, onEdit, onDelete, onViewDetails }) => {
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
      header: 'Tipe Rekening',
    },
    {
      accessorKey: 'balance',
      header: 'Saldo',
      cell: ({ row }) => {
        const balance = row.getValue('balance') as number;
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
        }).format(balance);
      },
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const account = row.original;
        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(account)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(account)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(account)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      onAddData={() => {}}
      addButtonLabel="Tambah Rekening"
    />
  );
};