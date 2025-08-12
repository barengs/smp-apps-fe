import React, { useState } from 'react';
import { useGetCoaQuery, useDeleteCoaMutation, Coa } from '@/store/slices/coaApi';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
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
import * as toast from '@/utils/toast';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import CoaForm from './CoaForm';

const CoaTable: React.FC = () => {
  const { data, isLoading, isError, error } = useGetCoaQuery();
  const [deleteCoa, { isLoading: isDeleting }] = useDeleteCoaMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCoa, setSelectedCoa] = useState<Coa | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [coaToDelete, setCoaToDelete] = useState<string | null>(null);

  const handleAdd = () => {
    setSelectedCoa(null);
    setIsFormOpen(true);
  };

  const handleEdit = (coa: Coa) => {
    setSelectedCoa(coa);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (code: string) => {
    setCoaToDelete(code);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (coaToDelete) {
      try {
        await deleteCoa(coaToDelete).unwrap();
        toast.showSuccess('Akun berhasil dihapus');
        setIsDeleteDialogOpen(false);
        setCoaToDelete(null);
      } catch (err) {
        toast.showError('Gagal menghapus akun');
      }
    }
  };

  const columns: ColumnDef<Coa>[] = [
    {
      accessorKey: 'coa_code',
      header: 'Kode COA',
    },
    {
      accessorKey: 'account_name',
      header: 'Nama Akun',
    },
    {
      accessorKey: 'account_type',
      header: 'Tipe Akun',
      cell: ({ row }) => <span className="capitalize">{row.original.account_type.toLowerCase()}</span>,
    },
    {
      accessorKey: 'parent_coa_code',
      header: 'Induk Akun',
    },
    {
      accessorKey: 'is_postable',
      header: 'Dapat Diposting',
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.original.is_postable
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.original.is_postable ? 'Ya' : 'Tidak'}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const coa = row.original;
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
              <DropdownMenuItem onClick={() => handleEdit(coa)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDeleteDialog(coa.coa_code)}>Hapus</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return <TableLoadingSkeleton numRows={10} />;
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
        exportFileName="chart_of_accounts"
        exportTitle="Bagan Akun Standar"
        onAddData={handleAdd} // Tombol "Tambah Akun" dipindahkan ke sini
      />
      <CoaForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        coa={selectedCoa}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus akun secara permanen.
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

export default CoaTable;