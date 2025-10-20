import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { showSuccess, showError, showWarning } from '@/utils/toast';
import { DataTable } from '../../components/DataTable';
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
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import KelompokPendidikanForm from './KelompokPendidikanForm';
import { useGetEducationGroupsQuery, useDeleteEducationGroupMutation } from '@/store/slices/educationGroupApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';
import { useLocalPagination } from '@/hooks/useLocalPagination';

interface KelompokPendidikan {
  id: number;
  code: string;
  name: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  education: Array<{
    id: number;
    name: string;
    description: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    pivot: {
      education_class_id: string;
      education_id: string;
    };
  }>;
}

const KelompokPendidikanTable: React.FC = () => {
  const { data: educationGroupsData, error, isLoading } = useGetEducationGroupsQuery();
  const [deleteEducationGroup] = useDeleteEducationGroupMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<KelompokPendidikan | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dataToDelete, setDataToDelete] = useState<KelompokPendidikan | undefined>(undefined);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const educationGroups: KelompokPendidikan[] = useMemo(() => {
    if (Array.isArray(educationGroupsData)) {
      return educationGroupsData.map(item => ({
        id: item.id,
        code: item.code,
        name: item.name,
        deleted_at: item.deleted_at,
        created_at: item.created_at,
        updated_at: item.updated_at,
        education: item.education || [],
      }));
    }
    return [];
  }, [educationGroupsData]);

  const { paginatedData, pagination, setPagination, pageCount } = useLocalPagination<KelompokPendidikan>(educationGroups, 10);

  const handleAddData = () => {
    setEditingData(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (data: KelompokPendidikan) => {
    setEditingData(data);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (data: KelompokPendidikan) => {
    setDataToDelete(data);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (dataToDelete) {
      try {
        await deleteEducationGroup(dataToDelete.code).unwrap();
        showSuccess(`Kelompok Pendidikan "${dataToDelete.name}" berhasil dihapus.`);
      } catch (err) {
        const fetchError = err as FetchBaseQueryError;
        const errorMessage = (fetchError.data as { message?: string })?.message || 'Gagal menghapus data.';
        showError(errorMessage);
      } finally {
        setDataToDelete(undefined);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingData(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingData(undefined);
  };

  const handleImportData = () => {
    // setIsImportModalOpen(true); // Commented out since import dialog doesn't exist
    showWarning('Fitur import belum tersedia.');
  };

  const columns: ColumnDef<KelompokPendidikan>[] = useMemo(
    () => [
      {
        accessorKey: 'code',
        header: 'Kode',
      },
      {
        accessorKey: 'name',
        header: 'Nama Kelompok',
      },
      {
        accessorKey: 'education',
        header: 'Jenjang Pendidikan',
        cell: ({ row }) => {
          const educations = row.original.education;
          return educations && educations.length > 0
            ? educations.map(e => e.name).join(', ')
            : 'Tidak ada';
        },
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const data = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(data)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="danger"
                className="h-8 px-2 text-xs"
                onClick={() => handleDeleteClick(data)}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Hapus
              </Button>
            </div>
          );
        },
      },
    ],
    []
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
        exportFileName="data_kelompok_pendidikan"
        exportTitle="Data Kelompok Pendidikan"
        onAddData={handleAddData}
        onImportData={handleImportData}
        addButtonLabel="Tambah Kelompok Pendidikan"
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingData ? 'Edit Kelompok Pendidikan' : 'Tambah Kelompok Pendidikan Baru'}</DialogTitle>
            <DialogDescription>
              {editingData ? 'Ubah detail kelompok pendidikan ini.' : 'Isi detail untuk kelompok pendidikan baru.'}
            </DialogDescription>
          </DialogHeader>
          <KelompokPendidikanForm
            initialData={editingData}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus kelompok pendidikan{' '}
              <span className="font-semibold text-foreground">"{dataToDelete?.name}"</span> secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Lanjutkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* <KelompokPendidikanImportDialog
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      /> */}
    </>
  );
};

export default KelompokPendidikanTable;