import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/components/DataTable';
import { useGetInstitusiPendidikanQuery, useDeleteInstitusiPendidikanMutation } from '@/store/slices/institusiPendidikanApi';
import { InstitusiPendidikan } from '@/types/pendidikan';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import InstitusiPendidikanForm from './InstitusiPendidikanForm';
import * as toast from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

const InstitusiPendidikanTable: React.FC = () => {
  const { t } = useTranslation();
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
      education_level_id: item.education_level?.id || 0,
    }));
  }, [data]);

  const columns: ColumnDef<InstitusiPendidikan>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: t('institusiPendidikanTable.namaInstitusi'),
      },
      {
        accessorKey: 'education_level.name',
        header: t('institusiPendidikanTable.jenjangPendidikan'),
      },
      {
        accessorKey: 'category',
        header: t('institusiPendidikanTable.kategoriPendidikan'),
      },
      {
        accessorKey: 'number_of_classes',
        header: t('institusiPendidikanTable.jumlahKelas'),
      },
      {
        id: 'actions',
        header: t('actions.title'),
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
    [t]
  );

  if (isLoading) return <TableLoadingSkeleton numCols={5} />;
  if (error) return <div>Error memuat data.</div>;

  return (
    <>
      <DataTable
        columns={columns}
        data={tableData}
        exportFileName="data_institusi_pendidikan"
        exportTitle="Data Institusi Pendidikan"
        onAddData={handleAdd}
      />
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingData ? t('institusiPendidikanForm.editTitle') : t('institusiPendidikanForm.addTitle')}
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