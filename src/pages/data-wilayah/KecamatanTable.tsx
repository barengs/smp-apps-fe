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
import { useGetCitiesQuery } from '@/store/slices/cityApi';
import { useLocalPagination } from '@/hooks/useLocalPagination';

interface Kecamatan {
  id: number;
  code: string;
  name: string;
  city_code: string;
}

const KecamatanTable: React.FC = () => {
  const { data: districtsData, error, isLoading } = useGetDistrictsQuery();
  const { data: citiesData } = useGetCitiesQuery();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKecamatan, setEditingKecamatan] = useState<Kecamatan | undefined>(undefined);

  const citiesMap = useMemo(() => {
    const map = new Map<string, string>();
    citiesData?.forEach(city => {
      map.set(city.code, city.name);
    });
    return map;
  }, [citiesData]);

  const districts: Kecamatan[] = useMemo(() => {
    return districtsData || [];
  }, [districtsData]);

  const { paginatedData, pagination, setPagination, pageCount } = useLocalPagination<Kecamatan>(districts);

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
        accessorFn: row => citiesMap.get(row.city_code) || row.city_code || '-',
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
    [citiesMap]
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
        data={paginatedData}
        exportFileName="data_kecamatan"
        exportTitle="Data Kecamatan"
        onAddData={handleAddData}
        addButtonLabel="Tambah Kecamatan"
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
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