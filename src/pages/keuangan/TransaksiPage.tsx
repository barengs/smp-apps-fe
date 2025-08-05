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

const TransaksiPage: React.FC = () => {
  // Destructuring langsung dari hook useGetTransactionsQuery
  const { data: apiResponse, isLoading, isError, error } = useGetTransactionsQuery();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Mock data for development until API is ready
  const mockData: Transaksi[] = [
    { id: 1, transaction_date: '2023-10-27', account_number: '123456789', santri_name: 'Ahmad Fauzi', transaction_type: 'deposit', amount: 500000, description: 'Setoran bulanan', created_at: '', updated_at: '' },
    { id: 2, transaction_date: '2023-10-26', account_number: '987654321', santri_name: 'Budi Santoso', transaction_type: 'withdrawal', amount: 100000, description: 'Pembelian buku', created_at: '', updated_at: '' },
  ];

  const transactionsData = apiResponse?.data?.data || mockData;

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/administrasi' },
    { label: 'Bank Santri' },
    { label: 'Transaksi', icon: <Receipt className="h-4 w-4" /> },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const columns: ColumnDef<Transaksi>[] = [
    {
      accessorKey: 'transaction_date',
      header: 'Tanggal',
      cell: ({ row }) => new Date(row.original.transaction_date).toLocaleDateString('id-ID'),
    },
    {
      accessorKey: 'account_number',
      header: 'No. Rekening',
    },
    {
      accessorKey: 'santri_name',
      header: 'Nama Santri',
    },
    {
      accessorKey: 'transaction_type',
      header: 'Tipe',
      cell: ({ row }) => {
        const type = row.original.transaction_type;
        const variant = type === 'deposit' ? 'default' : 'secondary';
        const text = type === 'deposit' ? 'Setoran' : 'Penarikan';
        return <Badge variant={variant} className="capitalize">{text}</Badge>;
      },
    },
    {
      accessorKey: 'amount',
      header: 'Jumlah',
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: 'description',
      header: 'Deskripsi',
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: () => {
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
                }}
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