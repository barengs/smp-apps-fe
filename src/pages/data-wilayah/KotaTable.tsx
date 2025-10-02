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
import KotaForm from './KotaForm.tsx';
import { useGetCitiesQuery } from '@/store/slices/cityApi';
import { useGetProvincesQuery } from '@/store/slices/provinceApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';

interface Kota {
  id: number;
  code: string;
  name: string;
  province_code: string;
  province: {
    name: string;
  };
}

const KotaTable: React.FC = () => {
  const { data: citiesData, error, isLoading } = useGetCitiesQuery();
  const { data: provincesData } = useGetProvincesQuery();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKota, setEditingKota] = useState<Kota | undefined>(undefined);

  // Mapping provinces untuk lookup
  const provincesMap = useMemo(() => {
    const map = new Map<string, string>();
    provincesData?.forEach(province => {
      map.set(province.code, province.name);
    });
    return map;
  }, [provincesData]);

  const cities: Kota[] = useMemo(() => {
    return citiesData || [];
  }, [citiesData]);

  const handleAddData = () => {
    setEditingKota(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (kota: Kota) => {
    setEditingKota(kota);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingKota(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingKota(undefined);
  };

  const columns: ColumnDef<Kota>[] = useMemo(
    () => [
      {
        accessorKey: 'code',
        header: 'Kode',
      },
      {
        accessorKey: 'name',
        header: 'Nama Kota',
      },
      {
        accessorFn: row => {
          // Gunakan Map untuk lookup nama provinsi
          return provincesMap.get(row.province_code) || row.province_code || '-';
        },
        id: 'provinceName',
        header: 'Provinsi',
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const kota = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(kota)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
          );
        },
      },
    ],
    [provincesMap]
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
        data={cities}
        exportFileName="data_kota"
        exportTitle="Data Kota"
        onAddData={handleAddData}
        addButtonLabel="Tambah Kota"
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingKota ? 'Edit Kota' : 'Tambah Kota Baru'}</DialogTitle>
            <DialogDescription>
              {editingKota ? 'Ubah detail kota ini.' : 'Isi detail untuk kota baru.'}
            </DialogDescription>
          </DialogHeader>
          <KotaForm
            initialData={editingKota}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KotaTable;