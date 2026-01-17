import React, { useState } from 'react';
import { useGetStudiesQuery, useDeleteStudyMutation, useExportStudiesMutation, useBackupStudiesMutation } from '@/store/slices/studyApi';
import { MataPelajaran } from '@/types/pendidikan';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2, Download, Upload, DatabaseBackup } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  // DialogTrigger, // DialogTrigger dihapus karena tombol akan dirender oleh DataTable
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import MataPelajaranForm from './MataPelajaranForm';
import MataPelajaranImportDialog from './MataPelajaranImportDialog'; // Import dialog impor
import * as toast from '@/utils/toast';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { useLocalPagination } from '@/hooks/useLocalPagination';

const MataPelajaranTable: React.FC = () => {
  const { data: studies, isLoading, isError, refetch } = useGetStudiesQuery({});
  const [deleteStudy] = useDeleteStudyMutation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState<MataPelajaran | undefined>(undefined);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false); // State untuk dialog impor

  // Siapkan data dan kontrol pagination lokal
  const studiesData = studies || [];
  const { paginatedData, pagination, setPagination, pageCount } =
    useLocalPagination<MataPelajaran>(studiesData, 10);

  const [exportStudies, { isLoading: isExporting }] = useExportStudiesMutation();
  const [backupStudies, { isLoading: isBackingUp }] = useBackupStudiesMutation();

  const handleDelete = async (id: string) => {
    try {
      await deleteStudy(id).unwrap();
      toast.showSuccess('Mata pelajaran berhasil dihapus!');
      refetch();
    } catch (error) {
      toast.showError('Gagal menghapus mata pelajaran.');
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    refetch();
  };

  // Fungsi untuk menangani klik tombol 'Tambah Data' dari DataTable
  const handleAddDataClick = () => {
    setSelectedStudy(undefined); // Reset selected study for new entry
    setIsFormOpen(true); // Open the form dialog
  };

  const handleImportData = () => {
    setIsImportModalOpen(true);
  };

  const columns: ColumnDef<MataPelajaran>[] = [
    {
      id: 'no',
      header: 'No',
      cell: ({ row }) => {
        return (pagination.pageIndex * pagination.pageSize) + row.index + 1;
      },
    },
    {
      accessorKey: 'name',
      header: 'Nama Mata Pelajaran',
    },
    {
      accessorKey: 'description',
      header: 'Deskripsi',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const study = row.original;
        return (
          <div className="text-right">
            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Buka menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedStudy(study);
                      setIsFormOpen(true);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem>
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Hapus</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Ini akan menghapus mata pelajaran secara permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(study.id)}>
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return <TableLoadingSkeleton />;
  }

  if (isError) {
    return <div className="text-center text-red-500">Gagal memuat data. Silakan coba lagi.</div>;
  }

  return (
    <div>
      {/* Dialog ini sekarang dikontrol oleh state isFormOpen */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        {/* DialogTrigger dihapus */}
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedStudy ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}</DialogTitle>
          </DialogHeader>
          <MataPelajaranForm onSuccess={handleFormSuccess} initialData={selectedStudy} />
        </DialogContent>
      </Dialog>
      <DataTable
        columns={columns}
        data={paginatedData}
        onAddData={handleAddDataClick}
        addButtonLabel="Tambah Mata Pelajaran"
        // Aktifkan pagination manual agar page size & navigasi konsisten
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
                    const blob = await exportStudies().unwrap();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `Data_MataPelajaran_${new Date().toISOString().split('T')[0]}.xlsx`);
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
                    const blob = await backupStudies().unwrap();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `Backup_MataPelajaran_${new Date().toISOString().split('T')[0]}.csv`);
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

      <MataPelajaranImportDialog
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};

export default MataPelajaranTable;