import React, { useState } from 'react';
import { useGetProdukBankQuery, useDeleteProdukBankMutation, ProdukBank } from '@/store/slices/produkBankApi';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal } from 'lucide-react'; // Ditambahkan
import { ColumnDef } from '@tanstack/react-table'; // Ditambahkan
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
import * as toast from '@/utils/toast'; // Diperbaiki
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import ProdukForm from './ProdukForm';

const ProdukTable: React.FC = () => {
  const { data, isLoading, isError, error } = useGetProdukBankQuery();
  const [deleteProdukBank, { isLoading: isDeleting }] = useDeleteProdukBankMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduk, setSelectedProduk] = useState<ProdukBank | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [produkToDelete, setProdukToDelete] = useState<string | null>(null);

  const handleAdd = () => {
    setSelectedProduk(null);
    setIsFormOpen(true);
  };

  const handleEdit = (produk: ProdukBank) => {
    setSelectedProduk(produk);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (code: string) => {
    setProdukToDelete(code);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (produkToDelete) {
      try {
        await deleteProdukBank(produkToDelete).unwrap();
        toast.showSuccess('Produk berhasil dihapus');
        setIsDeleteDialogOpen(false);
        setProdukToDelete(null);
      } catch (err) {
        toast.showError('Gagal menghapus produk');
      }
    }
  };

  const columns: ColumnDef<ProdukBank>[] = [
    {
      accessorKey: 'product_code',
      header: 'Kode Produk',
    },
    {
      accessorKey: 'product_name',
      header: 'Nama Produk',
    },
    {
      accessorKey: 'product_type',
      header: 'Jenis',
      cell: ({ row }) => <span className="capitalize">{row.original.product_type.toLowerCase()}</span>,
    },
    {
      accessorKey: 'interest_rate',
      header: 'Bunga (%)',
      cell: ({ row }) => `${parseFloat(row.original.interest_rate)}%`, // Ensure it's a number
    },
    {
      accessorKey: 'admin_fee',
      header: 'Biaya Admin',
      cell: ({ row }) => `Rp ${parseFloat(row.original.admin_fee).toLocaleString('id-ID')}`, // Ensure it's a number
    },
    {
      accessorKey: 'opening_fee', // New column for opening_fee
      header: 'Biaya Pembukaan',
      cell: ({ row }) => `Rp ${parseFloat(row.original.opening_fee).toLocaleString('id-ID')}`, // Format as currency
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.original.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.original.is_active ? 'Aktif' : 'Tidak Aktif'}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const produk = row.original;
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
              <DropdownMenuItem onClick={() => handleEdit(produk)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDeleteDialog(produk.product_code)}>
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return <TableLoadingSkeleton numRows={5} />;
  }

  if (isError) {
    console.error(error);
    return <div className="text-red-500">Terjadi kesalahan saat memuat data.</div>;
  }

  return (
    <div>
      <DataTable 
        columns={columns} 
        data={data?.data || []} 
        exportFileName="produk_bank"
        exportTitle="Daftar Produk Bank"
        onAddData={handleAdd} // Tombol "Tambah Produk" dipindahkan ke sini
      />
      <ProdukForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        produk={selectedProduk}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus produk secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProdukTable;