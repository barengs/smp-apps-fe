import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Download, Upload, DatabaseBackup } from 'lucide-react';
import * as toast from '@/utils/toast';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import JenjangPendidikanForm from './JenjangPendidikanForm';
import JenjangPendidikanImportDialog from './JenjangPendidikanImportDialog';
import { useGetEducationLevelsQuery, useDeleteEducationLevelMutation, useExportEducationLevelsMutation, useBackupEducationLevelsMutation } from '@/store/slices/educationApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';
// Mengimpor NestedEducationClass dari educationApi untuk konsistensi tipe
import type { NestedEducationClass } from '@/store/slices/educationApi';
import { useLocalPagination } from '@/hooks/useLocalPagination';

interface JenjangPendidikan {
  id: number;
  name: string;
  description: string;
  education_class: NestedEducationClass[]; // Mengubah menjadi array objek
}

const JenjangPendidikanTable: React.FC = () => {
  const { data: educationLevelsData, error, isLoading } = useGetEducationLevelsQuery({});
  const [deleteEducationLevel] = useDeleteEducationLevelMutation();
  const [exportEducation, { isLoading: isExporting }] = useExportEducationLevelsMutation();
  const [backupEducation, { isLoading: isBackingUp }] = useBackupEducationLevelsMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<JenjangPendidikan | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dataToDelete, setDataToDelete] = useState<JenjangPendidikan | undefined>(undefined);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const educationLevels: JenjangPendidikan[] = useMemo(() => {
    if (educationLevelsData && Array.isArray(educationLevelsData)) {
      return educationLevelsData.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || 'Tidak ada deskripsi',
        education_class: item.education_class || [],
      }));
    }
    return [];
  }, [educationLevelsData]);

  const { paginatedData, pagination, setPagination, pageCount } = useLocalPagination<JenjangPendidikan>(educationLevels);

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
        toast.showSuccess(`Jenjang Pendidikan "${dataToDelete.name}" berhasil dihapus.`);
      } catch (err) {
        const fetchError = err as FetchBaseQueryError;
        const errorMessage = (fetchError.data as { message?: string })?.message || 'Gagal menghapus data.';
        toast.showError(errorMessage);
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
        accessorKey: 'name',
        header: 'Nama Jenjang',
      },
      {
        accessorKey: 'education_class', // Mengakses properti education_class (array)
        header: 'Kelompok Pendidikan',
        cell: ({ row }) => {
          const educationClasses = row.original.education_class;
          // Menggabungkan nama-nama kelompok pendidikan menjadi satu string
          return educationClasses && educationClasses.length > 0
            ? educationClasses.map(ec => ec.name).join(', ')
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

  if (isLoading) return <TableLoadingSkeleton numCols={3} />;

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
        onAddData={handleAddData}
        addButtonLabel="Tambah Jenjang Pendidikan"
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        exportImportElement={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" disabled={isExporting || isBackingUp}>
                <Upload className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">Import / Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] z-[60]">
              <DropdownMenuItem onClick={handleImportData}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={async () => {
                  const loadingId = toast.showLoading('Mengunduh data export...');
                  try {
                    const blob = await exportEducation().unwrap();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `Data_JenjangPendidikan_${new Date().toISOString().split('T')[0]}.xlsx`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    toast.showSuccess('Export berhasil diunduh');
                  } catch (error) {
                    toast.showError('Gagal melakukan export data');
                    console.error(error);
                  } finally {
                    toast.dismissToast(loadingId);
                  }
                }} 
                disabled={isExporting}
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export (XLSX)'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={async () => {
                  const loadingId = toast.showLoading('Mengunduh backup data...');
                  try {
                    const blob = await backupEducation().unwrap();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `Backup_JenjangPendidikan_${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    toast.showSuccess('Backup berhasil diunduh');
                  } catch (error) {
                    toast.showError('Gagal melakukan backup data');
                    console.error(error);
                  } finally {
                    toast.dismissToast(loadingId);
                  }
                }} 
                disabled={isBackingUp}
              >
                <DatabaseBackup className="h-4 w-4 mr-2" />
                {isBackingUp ? 'Backing up...' : 'Backup (CSV)'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
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