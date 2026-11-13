import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, Download, Upload, DatabaseBackup } from 'lucide-react';
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
import AsramaForm from './AsramaForm';
import AssignHostelHeadModal from './AssignHostelHeadModal';
import AsramaDetailModal from './AsramaDetailModal';
import AsramaImportDialog from './AsramaImportDialog'; // Import dialog impor
import { useGetHostelsQuery, useDeleteHostelMutation, useExportHostelsMutation, useBackupHostelsMutation } from '@/store/slices/hostelApi';
import { useGetProgramsQuery } from '@/store/slices/programApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';
import { useLocalPagination } from '@/hooks/useLocalPagination';

interface Asrama {
  id: number;
  name: string;
  description: string;
  program: { // Menambahkan properti program
    id: number;
    name: string;
  };
  capacity: number; // Menambahkan properti capacity
  headName?: string; // Menambahkan properti kepala asrama
}

const AsramaTable: React.FC = () => {
  const { data: hostelsData, error, isLoading } = useGetHostelsQuery();
  const [deleteHostel] = useDeleteHostelMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsrama, setEditingAsrama] = useState<Asrama | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [asramaToDelete, setAsramaToDelete] = useState<Asrama | undefined>(undefined);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false); // State untuk dialog impor
  const [isAssignHeadOpen, setIsAssignHeadOpen] = useState(false);
  const [selectedHostelId, setSelectedHostelId] = useState<number | null>(null);
  const [selectedHostelName, setSelectedHostelName] = useState<string | undefined>(undefined);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAsrama, setSelectedAsrama] = useState<Asrama | undefined>(undefined);

  const asramas: Asrama[] = useMemo(() => {
    if (hostelsData?.data) {
      return hostelsData.data.map((apiHostel: any) => {
        const currentHead = apiHostel?.current_head;
        const headFirst = currentHead?.staff?.first_name ?? '';
        const headLast = currentHead?.staff?.last_name ?? '';
        const derivedHeadName = `${headFirst} ${headLast}`.trim() || currentHead?.staff?.user?.name || currentHead?.name || undefined;
        return ({
          id: apiHostel.id,
          name: apiHostel.name,
          description: apiHostel.description || 'Tidak ada deskripsi',
          program: apiHostel.program,
          capacity: apiHostel.capacity,
          headName: derivedHeadName,
          // simpan current_head untuk pengecekan null di kolom
          current_head: currentHead,
        });
      });
    }
    return [];
  }, [hostelsData]);

  // Ambil daftar program untuk opsi filter
  const { data: programsResp } = useGetProgramsQuery({ per_page: 1000 });
  const programFilterOptions = useMemo(
    () =>
      (programsResp?.data ?? []).map((p: any) => ({
        label: p.name,
        value: p.name,
      })),
    [programsResp]
  );

  const { paginatedData, pagination, setPagination, pageCount } = useLocalPagination<Asrama>(asramas);

  /* -------------------------------------------------------------------------- */
  /*                             STATE EXPORT / BACKUP                           */
  /* -------------------------------------------------------------------------- */
  const [exportHostels, { isLoading: isExporting }] = useExportHostelsMutation();
  const [backupHostels, { isLoading: isBackingUp }] = useBackupHostelsMutation();

  const handleAddData = () => {
    setEditingAsrama(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (asrama: Asrama) => {
    setEditingAsrama(asrama);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (asrama: Asrama) => {
    setAsramaToDelete(asrama);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (asramaToDelete) {
      try {
        await deleteHostel(asramaToDelete.id).unwrap();
        toast.showSuccess(`Asrama "${asramaToDelete.name}" berhasil dihapus.`);
      } catch (err) {
        const fetchError = err as FetchBaseQueryError;
        const errorMessage = (fetchError.data as { message?: string })?.message || 'Gagal menghapus asrama.';
        toast.showError(errorMessage);
      } finally {
        setAsramaToDelete(undefined);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingAsrama(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingAsrama(undefined);
  };

  const handleImportData = () => {
    setIsImportModalOpen(true);
  };

  const columns: ColumnDef<Asrama>[] = useMemo(
    () => [
      {
        header: 'No',
        id: 'rowNumber',
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: 'name',
        header: 'Nama Asrama',
      },
      {
        id: 'program.name',
        header: 'Program',
        accessorFn: (row) => row.program?.name ?? '-',
        cell: ({ row }) => row.original.program?.name || '-',
      },
      {
        accessorKey: 'headName',
        header: 'Kepala',
        cell: ({ row }) => {
          const h = row.original.headName;
          if (h) return h;
          return (
            <Button
              variant="secondary"
              className="h-6 px-2 text-xs"
              onClick={() => {
                setSelectedHostelId(row.original.id);
                setSelectedHostelName(row.original.name);
                setIsAssignHeadOpen(true);
              }}
            >
              Belum Ada
            </Button>
          );
        },
      },
      {
        accessorKey: 'capacity',
        header: 'Kapasitas',
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const asrama = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => {
                  setSelectedAsrama(asrama);
                  setIsDetailOpen(true);
                }}
              >
                <Eye className="h-4 w-4 mr-1" /> Detail
              </Button>
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(asrama)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="danger"
                className="h-8 px-2 text-xs"
                onClick={() => handleDeleteClick(asrama)}
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

  const isNotFound = error && (error as FetchBaseQueryError).status === 404;
  if (error && !isNotFound) {
    return <div>Error: Gagal memuat data. Silakan coba lagi nanti.</div>;
  }



  return (
    <>
      <DataTable
        columns={columns}
        data={paginatedData}
        exportFileName="data_asrama"
        exportTitle="Data Asrama"
        onAddData={handleAddData}
        addButtonLabel="Tambah Asrama"
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        filterableColumns={{
          'program.name': {
            type: 'select',
            placeholder: 'Filter Program',
            options: programFilterOptions,
          },
        }}
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
                    const blob = await exportHostels().unwrap();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `Data_Asrama_${new Date().toISOString().split('T')[0]}.xlsx`);
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
                    const blob = await backupHostels().unwrap();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `Backup_Asrama_${new Date().toISOString().split('T')[0]}.csv`);
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
            <DialogTitle>{editingAsrama ? 'Edit Asrama' : 'Tambah Asrama Baru'}</DialogTitle>
            <DialogDescription>
              {editingAsrama ? 'Ubah detail asrama ini.' : 'Isi detail untuk asrama baru.'}
            </DialogDescription>
          </DialogHeader>
          <AsramaForm
            initialData={editingAsrama}
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
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus asrama{' '}
              <span className="font-semibold text-foreground">"{asramaToDelete?.name}"</span> secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Lanjutkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AsramaImportDialog
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      <AssignHostelHeadModal
        isOpen={isAssignHeadOpen}
        onClose={() => setIsAssignHeadOpen(false)}
        hostelId={selectedHostelId}
        hostelName={selectedHostelName}
        onSuccess={() => {
          setIsAssignHeadOpen(false);
          setSelectedHostelId(null);
          setSelectedHostelName(undefined);
          toast.showSuccess("Data kepala asrama diperbarui.");
        }}
      />

      <AsramaDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedAsrama(undefined);
        }}
        asrama={selectedAsrama}
      />
    </>
  );
};

export default AsramaTable;