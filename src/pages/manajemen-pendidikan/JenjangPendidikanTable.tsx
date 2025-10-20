import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
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
import JenjangPendidikanForm from './JenjangPendidikanForm';
import JenjangPendidikanImportDialog from './JenjangPendidikanImportDialog';
import { useGetEducationLevelsQuery, useDeleteEducationLevelMutation } from '@/store/slices/educationApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';
import type { EducationLevelApiData } from '@/store/slices/educationApi';
import { useLocalPagination } from '@/hooks/useLocalPagination';

interface JenjangPendidikan {
  id: number;
  code: string;
  name: string;
  description: string;
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

const JenjangPendidikanTable: React.FC = () => {
  const { data: educationLevelsData, error, isLoading } = useGetEducationLevelsQuery();
  const [deleteEducationLevel] = useDeleteEducationLevelMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<JenjangPendidikan | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dataToDelete, setDataToDelete] = useState<JenjangPendidikan | undefined>(undefined);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const educationLevels: JenjangPendidikan[] = useMemo(() => {
    if (Array.isArray(educationLevelsData)) {
      return educationLevelsData.map(item => ({
        id: item.id,
        code: `EDU${item.id.toString().padStart(3, '0')}`, // Generate code from ID
        name: item.name,
        description: item.description || 'Tidak ada deskripsi',
        deleted_at: item.deleted_at,
        created_at: item.created_at,
        updated_at: item.updated_at,
        education: item.education || [],
      }));
    }
    return [];
  }, [educationLevelsData]);

  const { paginatedData, pagination, setPagination, pageCount } = useLocalPagination<JenjangPendidikan>(educationLevels, 10);

  const handleAddData = () => {
    setEditingData(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (data: JenjangPendidikan) => {
    setEditingData(data);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (data: JenjangPendidikan) => {
    setDataToDelete(data);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (dataToDelete) {
      try {
        await deleteEducationLevel(dataToDelete.id).unwrap();
        showSuccess(`Jenjang Pendidikan "${dataToDelete.name}" berhasil dihapus.`);
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
    setIsImportModalOpen(true);
  };

  const columns: ColumnDef<JenjangPendidikan>[] = useMemo(
    () => [
      {
        accessorKey: 'code',
        header: 'Kode',
      },
      {
        accessorKey: 'name',
        header: 'Nama Jenjang',
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
        accessorKey: 'description',
        header: 'Deskripsi',
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

  // Treat 404 error as empty data, but show other errors
  const isNotFound = error && (error as FetchBaseQueryError).status === 404;
  if (error && !isNotFound) {
    return <div>Error: Gagal memuat data. Silakan coba lagi nanti.</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={paginatedData}
        exportFileName="data_jenjang_pendidikan"
        exportTitle="Data Jenjang Pendidikan"
        onAddData={handleAddData}
        onImportData={handleImportData}
        addButtonLabel="Tambah Jenjang Pendidikan"
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingData ? 'Edit Jenjang Pendidikan' : 'Tambah Jenjang Pendidikan Baru'}</DialogTitle>
            <DialogDescription>
              {editingData ? 'Ubah detail jenjang pendidikan ini.' : 'Isi detail untuk jenjang pendidikan baru.'}
            </DialogDescription>
          </DialogHeader>
          <JenjangPendidikanForm
            initialData={editingData ? {
              id: editingData.id,
              name: editingData.name,
              description: editingData.description,
              education_class: editingData.education.map(e => ({ code: e.id.toString(), name: e.name }))
            } : undefined}
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
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus jenjang pendidikan{' '}
              <span className="font-semibold text-foreground">"{dataToDelete?.name}"</span> secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Lanjutkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <JenjangPendidikanImportDialog
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </>
  );
};

export default JenjangPendidikanTable;