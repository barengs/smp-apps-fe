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
import KecamatanForm from './KecamatanForm.tsx';
import { useGetDistrictsQuery } from '@/store/slices/districtApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';

interface Kecamatan {
  id: number;
  code: string;
  name: string;
  city_code: string;
  city: {
    name: string;
  };
}

const KecamatanTable: React.FC = () => {
  const { data: districtsData, error, isLoading } = useGetDistrictsQuery();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKecamatan, setEditingKecamatan] = useState<Kecamatan | undefined>(undefined);

  const districts: Kecamatan[] = useMemo(() => {
    return districtsData || [];
  }, [districtsData]);

  const handleAddData = () => {
    setEditingKecamatan(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (kecamatan: Kecamatan) => {
    setEditingKecamatan(kecamatan);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingKecamatan(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingKecamatan(undefined);
  };

  const columns: ColumnDef<Kecamatan>[] = useMemo(
    () => [
      {
        accessorKey: 'code',
        header: 'Kode',
      },
      {
        accessorKey: 'name',
        header: 'Nama Kecamatan',
      },
      {
        accessorFn: row => row.city.name,
        id: 'cityName',
        header: 'Kota',
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const kecamatan = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(kecamatan)}
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
        data={districts}
        exportFileName="data_kecamatan"
        exportTitle="Data Kecamatan"
        onAddData={handleAddData}
        addButtonLabel="Tambah Kecamatan"
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingKecamatan ? 'Edit Kecamatan' : 'Tambah Kecamatan Baru'}</DialogTitle>
            <DialogDescription>
              {editingKecamatan ? 'Ubah detail kecamatan ini.' : 'Isi detail untuk kecamatan baru.'}
            </DialogDescription>
          </DialogHeader>
          <KecamatanForm
            initialData={editingKecamatan}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KecamatanTable;