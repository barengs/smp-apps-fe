import React, { useState } from 'react';
import { useGetProdukBankQuery, useDeleteProdukBankMutation, ProdukBank } from '@/store/slices/produkBankApi';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
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
import ProdukForm from './ProdukForm';

const ProdukTable: React.FC = () => {
  const { data, isLoading, isError, error } = useGetProdukBankQuery();
  const [deleteProdukBank, { isLoading: isDeleting }] = useDeleteProdukBankMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduk, setSelectedProduk] = useState<ProdukBank | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [produkToDelete, setProdukToDelete] = useState<number | null>(null);

  const handleAdd = () => {
    setSelectedProduk(null);
    setIsFormOpen(true);
  };

  const handleEdit = (produk: ProdukBank) => {
    setSelectedProduk(produk);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (id: number) => {
    setProdukToDelete(id);
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
      accessorKey: 'nama_produk',
      header: 'Nama Produk',
    },
    {
      accessorKey: 'jenis_produk',
      header: 'Jenis',
      cell: ({ row }) => <span className="capitalize">{row.original.jenis_produk}</span>,
    },
    {
      accessorKey: 'saldo_minimum',
      header: 'Saldo Minimum',
      cell: ({ row }) => `Rp ${row.original.saldo_minimum.toLocaleString('id-ID')}`,
    },
    {
      accessorKey: 'biaya_administrasi',
      header: 'Biaya Admin',
      cell: ({ row }) => `Rp ${row.original.biaya_administrasi.toLocaleString('id-ID')}`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.original.status === 'aktif'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.original.status}
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
              <DropdownMenuItem onClick={() => openDeleteDialog(produk.id)}>
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return <TableLoadingSkeleton numRows={5} />; // Mengubah 'count' menjadi 'numRows'
  }

  if (isError) {
    console.error(error);
    return <div className="text-red-500">Terjadi kesalahan saat memuat data.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Daftar Produk Bank</h2>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Produk
        </Button>
      </div>
      <DataTable 
        columns={columns} 
        data={data?.data || []} 
        exportFileName="produk_bank" // Menambahkan prop exportFileName
        exportTitle="Daftar Produk Bank" // Menambahkan prop exportTitle
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