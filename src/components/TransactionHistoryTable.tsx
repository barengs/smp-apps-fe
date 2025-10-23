import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import { useGetTransactionsByAccountLast7DaysQuery } from '@/store/slices/bankApi';
import { Transaksi } from '@/types/keuangan';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface TransactionHistoryTableProps {
  accountNumber: string;
}

const formatCurrency = (amount: string | number) => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return 'N/A';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(numericAmount);
};

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'success':
      return 'default'; // Hijau untuk completed/success
    case 'pending':
      return 'secondary';
    case 'failed':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = ({ accountNumber }) => {
  const { data: apiResponse, isLoading, isError } = useGetTransactionsByAccountLast7DaysQuery({ accountNumber });

  const columns: ColumnDef<Transaksi>[] = [
    {
      accessorKey: 'created_at',
      header: 'Tanggal',
      cell: ({ row }) => format(new Date(row.getValue('created_at')), 'd MMM yyyy, HH:mm', { locale: id }),
    },
    {
      accessorKey: 'description',
      header: 'Deskripsi',
    },
    {
      accessorKey: 'transaction_type',
      header: 'Tipe',
      cell: ({ row }) => <Badge variant="secondary">{row.getValue('transaction_type')}</Badge>,
    },
    {
      accessorKey: 'amount',
      header: 'Jumlah',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        return <span className="font-medium">{formatCurrency(amount)}</span>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return <Badge variant={getStatusVariant(status)} className="capitalize">{status}</Badge>;
      },
    },
  ];

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (isError || !apiResponse?.data) {
    return <div className="text-center text-red-500 py-4">Gagal memuat riwayat transaksi.</div>;
  }

  return (
    <DataTable
      columns={columns}
      data={apiResponse.data}
      exportFileName={`riwayat_transaksi_${accountNumber}`}
      exportTitle="Riwayat Transaksi"
    />
  );
};