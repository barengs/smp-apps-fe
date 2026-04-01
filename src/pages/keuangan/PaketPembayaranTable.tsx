import React, { useState } from 'react';
import { 
  useGetPaymentPackagesQuery, 
  useDeletePaymentPackageMutation
} from '@/store/slices/paymentPackageApi';
import { PaymentPackage } from '@/types/keuangan';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Info } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import * as toast from '@/utils/toast';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import PaketPembayaranForm from './PaketPembayaranForm';
import { Badge } from '@/components/ui/badge';

const PaketPembayaranTable: React.FC = () => {
  const [params, setParams] = useState({ page: 1, per_page: 10, search: '' });
  const { data, isLoading, isError, error } = useGetPaymentPackagesQuery(params);
  const [deletePaket, { isLoading: isDeleting }] = useDeletePaymentPackageMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPaket, setSelectedPaket] = useState<PaymentPackage | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [paketToDelete, setPaketToDelete] = useState<number | null>(null);

  const handleAdd = () => {
    setSelectedPaket(null);
    setIsFormOpen(true);
  };

  const handleEdit = (paket: PaymentPackage) => {
    setSelectedPaket(paket);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (id: number) => {
    setPaketToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (paketToDelete) {
      try {
        await deletePaket(paketToDelete).unwrap();
        toast.showSuccess('Paket berhasil dihapus');
        setIsDeleteDialogOpen(false);
      } catch (err: any) {
        toast.showError(err?.data?.message || 'Gagal menghapus paket');
      }
    }
  };

  const columns: ColumnDef<PaymentPackage>[] = [
    {
      accessorKey: 'package_code',
      header: 'Kode Paket',
      cell: ({ row }) => <span className="font-mono font-bold text-blue-600">{row.original.package_code}</span>,
    },
    {
      accessorKey: 'package_name',
      header: 'Nama Paket',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.package_name}</span>
          <span className="text-xs text-gray-500">
            {row.original.academic_year} - {row.original.semester?.toUpperCase()}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'total_amount',
      header: 'Total Nominal',
      cell: ({ row }) => {
        const total = parseFloat(row.original.total_amount);
        const saku = parseFloat(row.original.saku_amount);
        return (
          <div className="flex flex-col items-end">
            <span className="font-bold">Rp {total.toLocaleString('id-ID')}</span>
            <span className="text-[10px] text-blue-500">Saku: Rp {saku.toLocaleString('id-ID')}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'items',
      header: 'Items',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {row.original.items?.slice(0, 2).map((item, i) => (
            <Badge key={i} variant="outline" className="text-[10px] py-0 px-1">
              {item.item_name}
            </Badge>
          ))}
          {(row.original.items?.length || 0) > 2 && (
            <Badge variant="outline" className="text-[10px] py-0 px-1 bg-gray-50">
              +{(row.original.items?.length || 0) - 2} lagi
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'success' : 'destructive'}>
          {row.original.is_active ? 'Aktif' : 'Non-aktif'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => openDeleteDialog(row.original.id)}
            >
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) return <TableLoadingSkeleton numRows={5} />;
  if (isError) return <div className="p-4 text-red-500">Error: {(error as any)?.data?.message || 'Terjadi kesalahan'}</div>;

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data?.data || []}
        exportFileName="paket_pembayaran"
        exportTitle="Daftar Paket Pembayaran"
        onAddData={handleAdd}
        addButtonLabel="Tambah Paket"
        pageCount={data?.last_page || 1}
        pagination={{
            pageIndex: params.page - 1,
            pageSize: params.per_page,
        }}
        onPaginationChange={(p: any) => {
            const newPagination = typeof p === 'function' ? p({ pageIndex: params.page - 1, pageSize: params.per_page }) : p;
            setParams(prev => ({ ...prev, page: newPagination.pageIndex + 1, per_page: newPagination.pageSize }));
        }}
      />
      
      <PaketPembayaranForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        paket={selectedPaket} 
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Paket?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Paket hanya bisa dihapus jika belum ada riwayat pembayaran yang menggunakan paket ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PaketPembayaranTable;
