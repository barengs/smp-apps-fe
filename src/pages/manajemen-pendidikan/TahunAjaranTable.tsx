import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Download, Upload, DatabaseBackup } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import * as toast from '@/utils/toast';
import TahunAjaranForm from './TahunAjaranForm';
import { useGetTahunAjaranQuery, useExportTahunAjaranMutation, useBackupTahunAjaranMutation } from '@/store/slices/tahunAjaranApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useLocalPagination } from '@/hooks/useLocalPagination';

interface TahunAjaran {
  id: number;
  year: string;
  type?: string;
  periode?: string;
  start_date?: string;
  end_date?: string;
  active: boolean | number | string;
  description: string | null;
}

const TahunAjaranTable: React.FC = () => {
  const { data: tahunAjaranData, error, isLoading } = useGetTahunAjaranQuery();
  const [exportTahunAjaran, { isLoading: isExporting }] = useExportTahunAjaranMutation();
  const [backupTahunAjaran, { isLoading: isBackingUp }] = useBackupTahunAjaranMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTahunAjaran, setEditingTahunAjaran] = useState<TahunAjaran | undefined>(undefined);

  const academicYears: TahunAjaran[] = useMemo(() => {
    return (tahunAjaranData || []).map(p => ({
      ...p,
      description: p.description || 'Tidak ada deskripsi',
    }));
  }, [tahunAjaranData]);

  const { paginatedData, pagination, setPagination, pageCount } = useLocalPagination<TahunAjaran>(academicYears);

  const handleAddData = () => {
    setEditingTahunAjaran(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (tahunAjaran: TahunAjaran) => {
    setEditingTahunAjaran(tahunAjaran);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingTahunAjaran(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingTahunAjaran(undefined);
  };

  const getStatusValue = (active: boolean | number | string): boolean => {
    if (typeof active === 'boolean') return active;
    if (typeof active === 'number') return active === 1;
    if (typeof active === 'string') return active === '1';
    return false;
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const columns: ColumnDef<TahunAjaran>[] = useMemo(
    () => [
      {
        accessorKey: 'year',
        header: 'Tahun Ajaran',
      },
      {
        accessorKey: 'type',
        header: 'Tipe',
        cell: ({ row }) => row.original.type ? capitalizeFirst(row.original.type) : '-',
      },
      {
        accessorKey: 'periode',
        header: 'Periode',
        cell: ({ row }) => row.original.periode ? capitalizeFirst(row.original.periode) : '-',
      },
      {
        accessorKey: 'start_date',
        header: 'Tanggal Mulai',
        cell: ({ row }) => {
          const date = row.original.start_date;
          return date ? format(new Date(date), 'dd MMMM yyyy', { locale: id }) : '-';
        },
      },
      {
        accessorKey: 'end_date',
        header: 'Tanggal Akhir',
        cell: ({ row }) => {
          const date = row.original.end_date;
          return date ? format(new Date(date), 'dd MMMM yyyy', { locale: id }) : '-';
        },
      },
      {
        accessorKey: 'active',
        header: 'Status',
        cell: ({ row }) => {
          const isActive = getStatusValue(row.original.active);
          return (
            <Badge variant={isActive ? 'default' : 'destructive'}>
              {isActive ? 'Aktif' : 'Tidak Aktif'}
            </Badge>
          );
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
          const tahunAjaran = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(tahunAjaran)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  if (isLoading) return <TableLoadingSkeleton numCols={6} />;

  const isNotFound = error && (error as FetchBaseQueryError).status === 404;
  if (error && !isNotFound) {
    return <div>Error: Gagal memuat data. Silakan coba lagi nanti.</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={paginatedData}
        exportFileName="data_tahun_ajaran"
        exportTitle="Data Tahun Ajaran"
        onAddData={handleAddData}
        addButtonLabel="Tambah Tahun Ajaran"
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
               {/* No import for this module as per current requirement/existing code */}
              <DropdownMenuItem 
                onClick={async () => {
                  const loadingId = toast.showLoading('Mengunduh data export...');
                  try {
                    const blob = await exportTahunAjaran().unwrap();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `Data_TahunAjaran_${new Date().toISOString().split('T')[0]}.xlsx`);
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
                    const blob = await backupTahunAjaran().unwrap();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `Backup_TahunAjaran_${new Date().toISOString().split('T')[0]}.csv`);
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
            <DialogTitle>{editingTahunAjaran ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}</DialogTitle>
            <DialogDescription>
              {editingTahunAjaran ? 'Ubah detail tahun ajaran ini.' : 'Isi detail untuk tahun ajaran baru.'}
            </DialogDescription>
          </DialogHeader>
          <TahunAjaranForm
            initialData={editingTahunAjaran as any}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TahunAjaranTable;