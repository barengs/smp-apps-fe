import React, { useState } from 'react';
import { useGetCoaQuery, useDeleteCoaMutation, Coa } from '@/store/slices/coaApi';
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
import CoaForm from './CoaForm';

const CoaTable: React.FC = () => {
  const { data, isLoading, isError, error } = useGetCoaQuery();
  const [deleteCoa, { isLoading: isDeleting }] = useDeleteCoaMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCoa, setSelectedCoa] = useState<Coa | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [coaToDelete, setCoaToDelete] = useState<number | null>(null);

  const handleAdd = () => {
    setSelectedCoa(null);
    setIsFormOpen(true);
  };

  const handleEdit = (coa: Coa) => {
    setSelectedCoa(coa);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (id: number) => {
    setCoaToDelete(id);
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
      accessorKey: 'kode_akun',
      header: 'Kode Akun',
    },
    {
      accessorKey: 'nama_akun',
      header: 'Nama Akun',
      cell: ({ row }) => {
        const level = row.original.level || 0;
        return (
          <div style={{ paddingLeft: `${level * 20}px` }}>
            {row.original.nama_akun}
          </div>
        );
      },
    },
    {
      accessorKey: 'kategori_akun',
      header: 'Kategori',
      cell: ({ row }) => <span className="capitalize">{row.original.kategori_akun}</span>,
    },
    {
      accessorKey: 'posisi_akun',
      header: 'Posisi Saldo',
      cell: ({ row }) => <span className="capitalize">{row.original.posisi_akun}</span>,
    },
    {
      accessorKey: 'saldo_awal',
      header: 'Saldo Awal',
      cell: ({ row }) => `Rp ${row.original.saldo_awal.toLocaleString('id-ID')}`,
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
              <DropdownMenuItem onClick={() => openDeleteDialog(coa.id)}>Hapus</DropdownMenuItem>
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Bagan Akun Standar (COA)</h2>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Akun
        </Button>
      </div>
      <DataTable 
        columns={columns} 
        data={data?.data || []} 
        exportFileName="chart_of_accounts"
        exportTitle="Bagan Akun Standar"
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