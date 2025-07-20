import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DesaForm from './DesaForm.tsx';
import { useGetVillagesQuery } from '@/store/slices/villageApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';

interface Desa {
  id: number;
  code: string;
  name: string;
  district_code: string;
  district: {
    name: string;
  };
}

const DesaTable: React.FC = () => {
  const { data: villagesData, error, isLoading } = useGetVillagesQuery();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDesa, setEditingDesa] = useState<Desa | undefined>(undefined);

  const villages: Desa[] = useMemo(() => {
    return villagesData || [];
  }, [villagesData]);

  const handleAddData = () => {
    setEditingDesa(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (desa: Desa) => {
    setEditingDesa(desa);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingDesa(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingDesa(undefined);
  };

  const columns: ColumnDef<Desa>[] = useMemo(
    () => [
      {
        accessorKey: 'code',
        header: 'Kode',
      },
      {
        accessorKey: 'name',
        header: 'Nama Desa',
      },
      {
        accessorFn: row => row.district.name,
        id: 'districtName',
        header: 'Kecamatan',
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const desa = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(desa)}
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

  if (isLoading) return <TableLoadingSkeleton numCols={4} />;

  const isNotFound = error && (error as FetchBaseQueryError).status === 404;
  if (error && !isNotFound) {
    return <div>Error: Gagal memuat data. Silakan coba lagi nanti.</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={villages}
        exportFileName="data_desa"
        exportTitle="Data Desa"
        onAddData={handleAddData}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingDesa ? 'Edit Desa' : 'Tambah Desa Baru'}</DialogTitle>
            <DialogDescription>
              {editingDesa ? 'Ubah detail desa ini.' : 'Isi detail untuk desa baru.'}
            </DialogDescription>
          </DialogHeader>
          <DesaForm
            initialData={editingDesa}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DesaTable;