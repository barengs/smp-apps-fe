import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import { useGetInstitusiPendidikanQuery, useDeleteInstitusiPendidikanMutation } from '@/store/slices/institusiPendidikanApi';
import { InstitusiPendidikan } from '@/types/pendidikan';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import InstitusiPendidikanForm from './InstitusiPendidikanForm';
import * as toast from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const InstitusiPendidikanTable: React.FC = () => {
  const { data, error, isLoading } = useGetInstitusiPendidikanQuery();
  const [deleteInstitusi] = useDeleteInstitusiPendidikanMutation();
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
    return (data || []).map(item => ({
      ...item,
      education_id: item.education?.id || 0,
      education_class_id: item.education_class?.id || 0,
      headmaster_id: item.headmaster_id || '',
    }));
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
        data={data || []}
        exportFileName="data_institusi_pendidikan"
        exportTitle="Data Institusi Pendidikan"
        onAddData={handleAdd}
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