import React, { useState, useMemo } from 'react';
import { useGetCoaQuery, useDeleteCoaMutation, Coa } from '@/store/slices/coaApi';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, ChevronDown, ChevronRight } from 'lucide-react';
import { ColumnDef, ExpandedState } from '@tanstack/react-table';
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
import { Badge } from '@/components/ui/badge';

// Menambahkan subRows ke interface Coa untuk keperluan tabel
interface CoaWithSubRows extends Coa {
  subRows?: CoaWithSubRows[];
}

const CoaTable: React.FC = () => {
  const { data, isLoading, isError, error } = useGetCoaQuery();
  // useDeleteCoaMutation tidak lagi digunakan karena fitur hapus dihilangkan
  // const [deleteCoa, { isLoading: isDeleting }] = useDeleteCoaMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCoa, setSelectedCoa] = useState<Coa | null>(null);
  // State dan fungsi terkait dialog hapus tidak lagi diperlukan
  // const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // const [coaToDelete, setCoaToDelete] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const tableData = useMemo(() => {
    if (!data) return [];
    // Fungsi rekursif untuk mengubah 'children' menjadi 'subRows'
    const transformData = (items: Coa[]): CoaWithSubRows[] => {
      return items.map(item => ({
        ...item,
        subRows: item.children && item.children.length > 0 ? transformData(item.children) : undefined,
      }));
    };
    return transformData(data);
  }, [data]);

  const handleAdd = () => {
    setSelectedCoa(null);
    setIsFormOpen(true);
  };

  const handleEdit = (coa: Coa) => {
    setSelectedCoa(coa);
    setIsFormOpen(true);
  };

  // Fungsi terkait dialog hapus tidak lagi diperlukan
  // const openDeleteDialog = (code: string) => {
  //   setCoaToDelete(code);
  //   setIsDeleteDialogOpen(true);
  // };

  // const handleDelete = async () => {
  //   if (coaToDelete) {
  //     try {
  //       await deleteCoa(coaToDelete).unwrap();
  //       toast.showSuccess('Akun berhasil dihapus');
  //       setIsDeleteDialogOpen(false);
  //       setCoaToDelete(null);
  //     } catch (err) {
  //       toast.showError('Gagal menghapus akun');
  //     }
  //   }
  // };

  const columns: ColumnDef<CoaWithSubRows>[] = [
    {
      accessorKey: 'account_name',
      header: 'Nama Akun',
      cell: ({ row }) => (
        <div
          style={{ paddingLeft: `${row.depth * 1.5}rem` }}
          className="flex items-center"
        >
          {row.getCanExpand() ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={row.getToggleExpandedHandler()}
              className="mr-2 p-1 h-auto"
            >
              {row.getIsExpanded() ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Button>
          ) : (
            <span className="mr-2 p-1 h-auto w-6 inline-block"></span> // Placeholder for alignment
          )}
          <div className="flex flex-col">
            <span className="font-medium">{row.original.account_name}</span>
            <span className="text-xs text-muted-foreground">{row.original.coa_code}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'account_type',
      header: 'Tipe Akun',
      cell: ({ row }) => <span className="capitalize">{row.original.account_type.toLowerCase()}</span>,
    },
    {
      accessorKey: 'is_postable',
      header: 'Dapat Diposting',
      cell: ({ row }) => {
        const isPostable = row.getValue('is_postable');
        // Handle both string and boolean values
        const canPost = isPostable === '1' || isPostable === true;
        return (
          <Badge variant={canPost ? 'default' : 'secondary'}>
            {canPost ? 'Ya' : 'Tidak'}
          </Badge>
        );
      },
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
              {/* Tombol hapus dihilangkan */}
              {/* <DropdownMenuItem onClick={() => openDeleteDialog(coa.coa_code)}>Hapus</DropdownMenuItem> */}
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
        data={tableData}
        exportFileName="data_coa"
        exportTitle="Data Chart of Accounts"
        onAddData={handleAdd}
        addButtonLabel="Tambah COA"
      />
      <CoaForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        coa={selectedCoa}
      />
      {/* AlertDialog untuk hapus dihilangkan */}
      {/* <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
      </AlertDialog> */}
    </div>
  );
};

export default CoaTable;