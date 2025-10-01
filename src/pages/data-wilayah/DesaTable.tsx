import React, { useMemo, useState, useEffect } from 'react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
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
import { useLazyGetVillagesQuery } from '@/store/slices/villageApi'; // Mengubah import menjadi useLazyGetVillagesQuery
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
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, // 0-based page index for tanstack-table
    pageSize: 5,
  });

  // Menggunakan useLazyGetVillagesQuery
  const [triggerGetVillages, { data: villagesResponse, error, isLoading, isFetching }] = useLazyGetVillagesQuery();

  // Memicu pengambilan data saat komponen dimuat atau paginasi berubah
  useEffect(() => {
    triggerGetVillages({
      page: pagination.pageIndex + 1, // 1-based page index for API
      per_page: pagination.pageSize,
    });
  }, [pagination, triggerGetVillages]); // Tambahkan triggerGetVillages ke dependency array

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDesa, setEditingDesa] = useState<Desa | undefined>(undefined);

  const villages: Desa[] = useMemo(() => {
    return villagesResponse?.data || [];
  }, [villagesResponse]);

  const pageCount = useMemo(() => {
    if (!villagesResponse) return -1;
    return Math.ceil(villagesResponse.total / villagesResponse.per_page);
  }, [villagesResponse]);

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

  if (isLoading && !villagesResponse) return <TableLoadingSkeleton numCols={4} />;

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
        addButtonLabel="Tambah Desa"
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