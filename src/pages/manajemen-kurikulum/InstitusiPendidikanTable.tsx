import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import { useGetInstitusiPendidikanQuery, useDeleteInstitusiPendidikanMutation, useExportInstitusiPendidikanMutation, useBackupInstitusiPendidikanMutation } from '@/store/slices/institusiPendidikanApi';
import { InstitusiPendidikan } from '@/types/pendidikan';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import InstitusiPendidikanForm from './InstitusiPendidikanForm';
import * as toast from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Download, Upload, DatabaseBackup } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const InstitusiPendidikanTable: React.FC = () => {
  const { data, error, isLoading } = useGetInstitusiPendidikanQuery({});
  const [deleteInstitusi] = useDeleteInstitusiPendidikanMutation();
  const [exportInstitusi, { isLoading: isExporting }] = useExportInstitusiPendidikanMutation();
  const [backupInstitusi, { isLoading: isBackingUp }] = useBackupInstitusiPendidikanMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<InstitusiPendidikan | undefined>(undefined);

  const handleAdd = () => {
    setEditingData(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (rowData: InstitusiPendidikan) => {
    setEditingData(rowData);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      try {
        await deleteInstitusi(id).unwrap();
        toast.showSuccess('Data berhasil dihapus.');
      } catch (error) {
        toast.showError('Gagal menghapus data.');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingData(undefined);
  };

  const tableData = useMemo(() => {
    if (data && Array.isArray(data)) {
      return data.map(item => ({
        ...item,
        education_id: item.education?.id || 0,
        education_class_id: item.education_class?.id || 0,
        headmaster_id: item.headmaster_id || '',
      }));
    }
    return [];
  }, [data]);

  const columns: ColumnDef<InstitusiPendidikan>[] = useMemo(
    () => [
      {
        accessorKey: 'institution_name',
        header: 'Nama Institusi',
      },
      {
        accessorKey: 'education.name',
        header: 'Jenjang Pendidikan',
      },
      {
        accessorKey: 'education_class.name',
        header: 'Kelompok Pendidikan',
      },
      {
        accessorKey: 'headmaster',
        header: 'Kepala Sekolah',
        cell: ({ row }) => {
          const headmaster = row.original.headmaster;
          return headmaster ? `${headmaster.first_name} ${headmaster.last_name}` : '-';
        },
      },
      {
        accessorKey: 'registration_number',
        header: 'Nomor Registrasi',
      },
      {
        accessorKey: 'institution_status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.institution_status;
          return (
            <Badge variant={status === 'active' ? 'success' : 'destructive'}>
              {status === 'active' ? 'Aktif' : 'Tidak Aktif'}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(row.original)}
            >
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Hapus
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  if (isLoading) return <TableLoadingSkeleton numCols={7} />;
  if (error) return <div>Error memuat data.</div>;

  return (
    <>
      <DataTable
        columns={columns}
        data={tableData}
        onAddData={handleAdd}
        addButtonLabel="Tambah Institusi"
        exportImportElement={
          <DropdownMenu>
             <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" disabled={isExporting || isBackingUp}>
                <Upload className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">Import / Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] z-[60]">
               {/* Note: User did not specify Import endpoint for Institusi, reusing Export/Backup only for now or placeholder Import? 
                   Wait, Staff had generic Import handleImportData but no endpoint in request. 
                   InstitusiPendidikanTable doesn't have an Import button existingly?
                   Reviewing file: It DOES NOT have onImportData prop passed to DataTable currently.
                   The request only said "Export and Backup". 
                   But I should keep UI consistent. If there is no Import function, maybe just Export/Backup? 
                   Or maybe generic import dialog exist? 
                   Checking file again: No `handleImport` function in InstitusiPendidikanTable. 
                   So I will hide Import option or check if I should add it.
                   User said: "menambah fasilitas export dan backup dalam bentuk dropdown". 
                   So I will just include Export and Backup.
               */}
              <DropdownMenuItem 
                onClick={async () => {
                  const loadingId = toast.showLoading('Mengunduh data export...');
                  try {
                    const blob = await exportInstitusi().unwrap();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `Data_Institusi_${new Date().toISOString().split('T')[0]}.xlsx`);
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
                    const blob = await backupInstitusi().unwrap();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `Backup_Institusi_${new Date().toISOString().split('T')[0]}.csv`);
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
            <DialogTitle>
              {editingData ? 'Edit Institusi Pendidikan' : 'Tambah Institusi Pendidikan'}
            </DialogTitle>
            <DialogDescription>
              {editingData ? 'Ubah detail institusi.' : 'Isi detail untuk institusi baru.'}
            </DialogDescription>
          </DialogHeader>
          <InstitusiPendidikanForm
            initialData={editingData}
            onSuccess={handleModalClose}
            onCancel={handleModalClose}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstitusiPendidikanTable;