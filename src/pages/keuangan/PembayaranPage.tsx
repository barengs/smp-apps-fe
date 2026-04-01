import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { PlusCircle, Wallet, History, FileText, CheckCircle2 } from 'lucide-react';
import { useGetPaymentsQuery } from '@/store/slices/paymentApi';
import { PaymentRecord } from '@/types/keuangan';
import { ColumnDef } from '@tanstack/react-table';
import { formatCurrency } from '@/utils/formatCurrency';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import PembayaranForm from './PembayaranForm';

const PembayaranPage: React.FC = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const { data, isLoading, isFetching } = useGetPaymentsQuery({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);

  const breadcrumbItems = [
    { label: 'Bank Santri' },
    { label: 'Pembayaran Paket' },
  ];

  const columns: ColumnDef<PaymentRecord>[] = [
    {
      accessorKey: 'paid_at',
      header: 'Tanggal',
      cell: ({ row }) => format(new Date(row.original.paid_at), 'dd MMM yyyy HH:mm', { locale: id }),
    },
    {
      accessorKey: 'reference_number',
      header: 'No. Referensi',
      cell: ({ row }) => <span className="font-mono font-bold text-xs">{row.original.reference_number}</span>,
    },
    {
      accessorKey: 'account_number',
      header: 'Santri',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {row.original.account?.customer 
              ? `${row.original.account.customer.first_name} ${row.original.account.customer.last_name || ''}`
              : row.original.account_number}
          </span>
          <span className="text-xs text-muted-foreground">{row.original.account_number}</span>
        </div>
      ),
    },
    {
      accessorKey: 'package.package_name',
      header: 'Paket',
      cell: ({ row }) => row.original.package?.package_name || '-',
    },
    {
      accessorKey: 'total_amount',
      header: 'Dibayarkan',
      cell: ({ row }) => (
        <div className="flex flex-col items-end">
          <span className="font-bold text-primary">{formatCurrency(parseFloat(row.original.total_amount))}</span>
          <span className="text-[10px] text-blue-500">Saku: {formatCurrency(parseFloat(row.original.saku_allocated))}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Sukses
        </Badge>
      ),
    },
  ];

  return (
    <DashboardLayout title="Manajemen Pembayaran Paket" role="administrasi">
      <CustomBreadcrumb items={breadcrumbItems} />
      
      <div className="container mx-auto mt-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Transaksi</p>
              <h3 className="text-2xl font-bold">{data?.total || 0}</h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Akumulasi Pembayaran</p>
              <h3 className="text-2xl font-bold">Terhitung</h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-full text-purple-600">
              <History className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Periode Aktif</p>
              <h3 className="text-2xl font-bold">2024/2025</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold">Riwayat Pembayaran Paket</h2>
              <p className="text-sm text-muted-foreground">Daftar alokasi saldo santri untuk paket pendidikan & asrama.</p>
            </div>
            <Button onClick={() => setIsFormOpen(true)} className="bg-primary hover:bg-primary/90">
              <PlusCircle className="h-4 w-4 mr-2" />
              Proses Pembayaran Baru
            </Button>
          </div>

          {isLoading ? (
            <TableLoadingSkeleton numRows={5} numCols={6} />
          ) : (
            <DataTable
              columns={columns}
              data={data?.data || []}
              pageCount={data?.last_page || 1}
              pagination={pagination}
              onPaginationChange={setPagination}
              exportFileName="riwayat_pembayaran_paket"
              exportTitle="Riwayat Pembayaran Paket Santri"
            />
          )}
        </div>
      </div>

      <PembayaranForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />
    </DashboardLayout>
  );
};

export default PembayaranPage;
