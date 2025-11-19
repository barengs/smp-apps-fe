import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import KategoriPelanggaranForm from './KategoriPelanggaranForm';
import {
  useGetViolationCategoriesQuery,
  useDeleteViolationCategoryMutation,
} from '@/store/slices/violationCategoryApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import type { ViolationCategory } from '@/store/slices/violationCategoryApi';
import { useLocalPagination } from '@/hooks/useLocalPagination';
import * as toast from '@/utils/toast';

const KategoriPelanggaranTable: React.FC = () => {
  const { data: categoryData, error, isLoading } = useGetViolationCategoriesQuery();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteViolationCategoryMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ViolationCategory | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<ViolationCategory | null>(null);

  const categoryList: ViolationCategory[] = useMemo(() => categoryData || [], [categoryData]);

  const { paginatedData, pagination, setPagination, pageCount } = useLocalPagination<ViolationCategory>(categoryList);

  const handleAddData = () => {
    setEditingItem(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (item: ViolationCategory) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingItem(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingItem(undefined);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    const toastId = toast.showLoading('Menghapus kategori...');
    try {
      await deleteCategory(target.id).unwrap();
      toast.showSuccess(`Kategori "${target.name}" berhasil dihapus.`);
    } catch (err: unknown) {
      let errorMessage = 'Terjadi kesalahan tidak dikenal.';
      if (typeof err === 'object' && err !== null) {
        if ('status' in err) {
          const fetchError = err as FetchBaseQueryError;
          if (fetchError.data && typeof fetchError.data === 'object' && 'message' in fetchError.data) {
            errorMessage = (fetchError.data as { message: string }).message;
          } else {
            errorMessage = 'Gagal memproses permintaan.';
          }
        } else if ('message' in err) {
          errorMessage = (err as { message?: string }).message ?? 'Error tidak diketahui';
        }
      }
      toast.showError(`Gagal menghapus kategori: ${errorMessage}`);
    } finally {
      toast.dismissToast(toastId);
    }
  };

  const columns: ColumnDef<ViolationCategory>[] = useMemo(
    () => [
      { accessorKey: 'name', header: 'Nama Kategori' },
      { accessorKey: 'description', header: 'Deskripsi' },
      {
        accessorKey: 'severity_level',
        header: 'Tingkat Keparahan',
        cell: ({ row }) => <span className="font-medium">{row.original.severity_level}</span>,
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) =>
          row.original.is_active ? (
            <Badge variant="success">Aktif</Badge>
          ) : (
            <Badge variant="outline">Nonaktif</Badge>
          ),
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div
              className="flex space-x-2"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="outline" className="h-8 px-2 text-xs" onClick={() => handleEditData(item)}>
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="outline-danger"
                className="h-8 px-2 text-xs"
                onClick={() => setDeleteTarget(item)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Hapus
              </Button>
            </div>
          );
        },
      },
    ],
    [isDeleting]
  );

  if (isLoading) return <TableLoadingSkeleton numCols={5} />;

  const isNotFound = error && (error as FetchBaseQueryError).status === 404;
  if (error && !isNotFound) {
    return <div>Error: Gagal memuat data. Silakan coba lagi nanti.</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={paginatedData}
        exportFileName="kategori_pelanggaran"
        exportTitle="Kategori Pelanggaran"
        onAddData={handleAddData}
        addButtonLabel="Tambah Kategori"
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Kategori Pelanggaran' : 'Tambah Kategori Pelanggaran'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Ubah detail kategori pelanggaran.' : 'Isi detail untuk kategori pelanggaran baru.'}
            </DialogDescription>
          </DialogHeader>
          <KategoriPelanggaranForm
            initialData={editingItem}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori Pelanggaran</AlertDialogTitle>
          </AlertDialogHeader>
          <p>Anda yakin ingin menghapus kategori "{deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default KategoriPelanggaranTable;