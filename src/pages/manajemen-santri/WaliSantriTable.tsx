import React, { useMemo, useState } from 'react';
import { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Download, Upload } from 'lucide-react';
import * as toast from '@/utils/toast';
import { DataTable } from '../../components/DataTable';
import { useGetParentsQuery, useExportParentsMutation, useBackupParentsMutation } from '@/store/slices/parentApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';
import { useNavigate } from 'react-router-dom';
import { useLocalPagination } from '@/hooks/useLocalPagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import WaliSantriImportDialog from './WaliSantriImportDialog';

// Interface for the data displayed in the table
interface WaliSantri {
  id: number;
  fullName: string;
  email: string;
  kk: string;
  nik: string;
  gender: string;
  parentAs: string;
}

const WaliSantriTable: React.FC = () => {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [importOpen, setImportOpen] = useState(false);

  // UPDATED: ambil refetch dari hook agar bisa me-refresh data tanpa reload
  const { data: parentsResponse, error, isLoading, isFetching, refetch } = useGetParentsQuery();

  const waliSantriList: WaliSantri[] = useMemo(() => {
    if (parentsResponse) {
      return parentsResponse.map(parent => ({
        id: parent.id,
        fullName: `${parent.parent.first_name} ${parent.parent.last_name || ''}`.trim(),
        email: parent.email,
        kk: parent.parent.kk,
        nik: parent.parent.nik,
        gender: parent.parent.gender === 'L' ? 'Laki-Laki' : parent.parent.gender === 'P' ? 'Perempuan' : 'Tidak Diketahui',
        parentAs: parent.parent.parent_as,
      }));
    }
    return [];
  }, [parentsResponse]);

  // Export & Backup Mutations
  const [exportParents] = useExportParentsMutation();
  const [backupParents] = useBackupParentsMutation();

  const handleDownloadFile = async (action: () => any, filename: string, loadingMessage: string) => {
    const loadingId = toast.showLoading(loadingMessage);
    try {
      // Call the mutation trigger and immediately unwrap the result
      const blob = await action().unwrap(); 
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      toast.dismissToast(loadingId);
      toast.showSuccess('File berhasil diunduh.');
    } catch (err) {
      toast.dismissToast(loadingId);
      toast.showError('Gagal mengunduh file.');
      console.error('Download error:', err);
    }
  };

  // Pagination client-side
  const { paginatedData, pagination, setPagination, pageCount } = useLocalPagination(waliSantriList, 10);

  const handleRowClick = (wali: WaliSantri) => {
    navigate(`/dashboard/wali-santri/${wali.id}`);
  };

  const columns: ColumnDef<WaliSantri>[] = useMemo(
    () => [
      {
        accessorKey: 'fullName',
        header: 'Nama Wali',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'kk',
        header: 'No. KK',
      },
      {
        accessorKey: 'nik',
        header: 'NIK',
      },
      {
        accessorKey: 'gender',
        header: 'Jenis Kelamin',
      },
      {
        accessorKey: 'parentAs',
        header: 'Status Wali',
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const waliSantri = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/dashboard/wali-santri/${waliSantri.id}/edit`);
                }}
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

  const handleExport = () => {
    // Trigger export via a hidden DataTable export by leveraging the same columns/data if needed.
    // Simpler: create and click a hidden anchor? We already have exportToExcel in DataTable,
    // but here we do not directly call it; we'll use a simple download by constructing sheet would require duplication.
    // Instead, we can render DataTable with export props and call its handler through ref, but DataTable doesn't expose it.
    // As a pragmatic approach, we dispatch a custom event listened by DataTable? Overkill.
    // We'll just use utils/export directly here to keep it simple.
    // Import at top? Not available here originally. We'll import now:
  };

  if (isLoading || isFetching) return <TableLoadingSkeleton numCols={7} />;

  const isNotFound = error && (error as FetchBaseQueryError).status === 404;
  if (error && !isNotFound) {
    return <div>Error: Gagal memuat data wali santri.</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={waliSantriList}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        exportImportElement={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Import / Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setImportOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const date = new Date().toISOString().split('T')[0];
                  handleDownloadFile(
                    exportParents,
                    `wali_santri_export_${date}.xlsx`,
                    'Mengekspor data wali santri...'
                  );
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export (XLSX)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const date = new Date().toISOString().split('T')[0];
                  handleDownloadFile(
                    backupParents,
                    `wali_santri_backup_${date}.csv`,
                    'Membackup data wali santri...'
                  );
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Backup (CSV)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
        onAddData={() => { toast.showWarning('Membuka form tambah data wali santri...'); }}
        onRowClick={handleRowClick}
        addButtonLabel="Tambah Wali Santri"
      />

      <WaliSantriImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={async () => {
          // REFRESH: refetch data setelah impor sukses
          const loadingId = toast.showLoading('Memuat data terbaru...');
          await refetch();
          toast.dismissToast(loadingId);
          toast.showSuccess('Data berhasil diimpor dan diperbarui.');
        }}
      />
    </>
  );
};

export default WaliSantriTable;