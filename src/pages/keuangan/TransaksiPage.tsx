import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Receipt } from 'lucide-react';

import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useGetTransactionsQuery } from '@/store/slices/bankApi';
import { Transaksi } from '@/types/keuangan';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TransaksiForm from './TransaksiForm';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const TransaksiPage: React.FC = () => {
  const { data: apiResponse, isLoading, isError, error } = useGetTransactionsQuery();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const mockData: Transaksi[] = [
    { id: 'trx_1', transaction_type: 'deposit', description: 'Setoran bulanan', amount: '500000', status: 'completed', reference_number: 'REF123', channel: 'web', source_account: 'SRC1', destination_account: 'DST1', created_at: '2023-10-27T14:15:22Z', updated_at: '2023-10-27T14:15:22Z' },
    { id: 'trx_2', transaction_type: 'withdrawal', description: 'Pembelian buku', amount: '100000', status: 'pending', reference_number: 'REF456', channel: 'mobile', source_account: 'SRC2', destination_account: 'DST2', created_at: '2023-10-26T14:15:22Z', updated_at: '2023-10-26T14:15:22Z' },
  ];

  const transactionsData = apiResponse?.data || mockData;

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/administrasi' },
    { label: 'Bank Santri' },
    { label: 'Transaksi', icon: <Receipt className="h-4 w-4" /> },
  ];

  const formatCurrency = (amount: string | number) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return 'N/A';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numericAmount);
  };

  const handleRowClick = (transaction: Transaksi) => {
    navigate(`/dashboard/bank-santri/transaksi/${transaction.id}`);
  };

  const columns: ColumnDef<Transaksi>[] = [
    {
      accessorKey: 'created_at',
      header: 'Tanggal',
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString('id-ID'),
    },
    {
      accessorKey: 'destination_account',
      header: 'Rekening Tujuan',
    },
    {
      accessorKey: 'description',
      header: 'Deskripsi',
    },
    {
      accessorKey: 'channel',
      header: 'Channel',
      cell: ({ row }) => {
        const channel = row.original.channel;
        return <Badge variant="secondary" className="capitalize">{channel}</Badge>;
      },
    },
    {
      accessorKey: 'amount',
      header: 'Jumlah',
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status.toLowerCase();
        const variant = status === 'completed' ? 'default' : status === 'pending' ? 'secondary' : 'destructive';
        return <Badge variant={variant} className="capitalize">{row.original.status}</Badge>;
      },
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleRowClick(transaction)}>Lihat Detail</DropdownMenuItem>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Hapus</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isError) {
    console.error("Error fetching transactions:", error);
    return (
      <DashboardLayout title="Transaksi Bank Santri" role="administrasi">
        <div className="text-red-500">Terjadi kesalahan saat memuat data.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Transaksi Bank Santri" role="administrasi">
      <div className="container mx-auto px-4 pb-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Manajemen Transaksi</CardTitle>
            <CardDescription>Kelola semua transaksi di bank santri.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && !apiResponse ? (
              <TableLoadingSkeleton />
            ) : (
              <DataTable
                columns={columns}
                data={transactionsData}
                exportFileName="transaksi_bank_santri"
                exportTitle="Data Transaksi Bank Santri"
                onAddData={() => setIsFormOpen(true)}
                filterableColumns={{
                  transaction_type: { placeholder: 'Filter by Tipe' },
                  status: { placeholder: 'Filter by Status' },
                }}
                onRowClick={handleRowClick} // Make rows clickable
              />
            )}
          </CardContent>
        </Card>
      </div>
      <TransaksiForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </DashboardLayout>
  );
};

export default TransaksiPage;