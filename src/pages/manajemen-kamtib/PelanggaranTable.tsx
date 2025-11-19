import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
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
import PelanggaranForm from './PelanggaranForm';
import { useGetViolationsQuery, useDeleteViolationMutation } from '@/store/slices/violationApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import type { Violation } from '@/store/slices/violationApi';
import { useLocalPagination } from '@/hooks/useLocalPagination';
import * as toast from '@/utils/toast';
import { Badge } from '@/components/ui/badge';
import { useGetViolationCategoriesQuery } from '@/store/slices/violationCategoryApi';

const PelanggaranTable: React.FC = () => {
  const { data: violationData, error, isLoading } = useGetViolationsQuery();
  const { data: categories } = useGetViolationCategoriesQuery();
  const [deleteViolation, { isLoading: isDeleting }] = useDeleteViolationMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Violation | undefined>(undefined);

  const [deleteTarget, setDeleteTarget] = useState<Violation | null>(null);

  const violationList: Violation[] = useMemo(() => {
    return violationData || [];
  }, [violationData]);

  const categoryMap = useMemo(() => {
    const map = new Map<number, string>();
    (categories ?? []).forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const { paginatedData, pagination, setPagination, pageCount } = useLocalPagination<Violation>(violationList);

  const handleAddData = () => {
    setEditingItem(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (item: Violation) => {
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
    const toastId = toast.showLoading('Menghapus pelanggaran...');
    try {
      await deleteViolation(target.id).unwrap();
      toast.showSuccess(`Pelanggaran "${target.name}" berhasil dihapus.`);
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
      toast.showError(`Gagal menghapus pelanggaran: ${errorMessage}`);
    } finally {
      toast.dismissToast(toastId);
    }
  };

  const columns: ColumnDef<Violation>[] = useMemo(
    () => [
      { accessorKey: 'name', header: 'Nama Pelanggaran' },
      {
        id: 'category',
        header: 'Kategori',
        cell: ({ row }) => <span>{categoryMap.get(row.original.category_id) ?? '-'}</span>,
      },
      {
        accessorKey: 'point',
        header: 'Poin',
        cell: ({ row }) => <span className="font-medium">{row.original.point}</span>,
      },
      { accessorKey: 'description', header: 'Deskripsi' },
      {
        id: 'status',
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
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(item)}
              >
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
    [isDeleting, categoryMap]
  );

  if (isLoading) return <TableLoadingSkeleton numCols={4} />;

  const isNotFound = error && (error as FetchBaseQueryError).status === 404;
  if (error && !isNotFound) {
    return <div>Error: Gagal memuat data. Silakan coba lagi nanti.</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={paginatedData}
        exportFileName="data_pelanggaran"
        exportTitle="Data Pelanggaran"
        onAddData={handleAddData}
        addButtonLabel="Tambah Pelanggaran"
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Pelanggaran' : 'Tambah Pelanggaran Baru'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Ubah detail pelanggaran ini.' : 'Isi detail untuk pelanggaran baru.'}
            </DialogDescription>
          </DialogHeader>
          <PelanggaranForm
            initialData={editingItem}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pelanggaran</AlertDialogTitle>
          </AlertDialogHeader>
          <p>Anda yakin ingin menghapus pelanggaran "{deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PelanggaranTable;