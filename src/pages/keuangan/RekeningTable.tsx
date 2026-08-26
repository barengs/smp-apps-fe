import React from 'react';
import { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import { Account } from '@/types/keuangan';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface RekeningTableProps {
  data: Account[];
  onViewDetails: (account: Account) => void;
  pagination?: PaginationState;
  onPaginationChange?: (updater: PaginationState) => void;
  pageCount?: number;
  sorting?: SortingState;
  onSortingChange?: (updater: SortingState) => void;
}

export const RekeningTable: React.FC<RekeningTableProps> = ({ data, onViewDetails, pagination, onPaginationChange, pageCount, sorting, onSortingChange }) => {
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
        const status = row.original.status.toLowerCase();
        let variant: 'default' | 'secondary' | 'destructive' | 'outline';
        
        if (status === 'aktif' || status === 'active') {
          variant = 'default'; // Hijau untuk aktif/active
        } else if (status === 'tidak aktif' || status === 'inactive') {
          variant = 'secondary'; // Abu-abu untuk tidak aktif
        } else if (status === 'dibekukan' || status === 'frozen') {
          variant = 'destructive'; // Merah untuk dibekukan
        } else if (status === 'ditutup' || status === 'closed') {
          variant = 'outline'; // Outline untuk ditutup
        } else {
          variant = 'outline'; // Outline untuk status lainnya
        }
        
        return <Badge variant={variant} className="capitalize">{row.original.status}</Badge>;
      },
    },
  ];

  const handleRowClick = (account: Account) => {
    navigate(`/dashboard/santri/rekening/${account.account_number}`);
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      exportFileName="data_rekening"
      exportTitle="Data Rekening"
      onRowClick={handleRowClick}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      pageCount={pageCount}
      sorting={sorting}
      onSortingChange={onSortingChange}
    />
  );
};