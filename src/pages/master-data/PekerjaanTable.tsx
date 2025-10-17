import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PekerjaanForm from './PekerjaanForm';
import { useGetPekerjaanQuery } from '@/store/slices/pekerjaanApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { Pekerjaan } from '@/types/master-data';
import { useLocalPagination } from '@/hooks/useLocalPagination';

const PekerjaanTable: React.FC = () => {
  const { data: pekerjaanData, error, isLoading } = useGetPekerjaanQuery();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPekerjaan, setEditingPekerjaan] = useState<Pekerjaan | undefined>(undefined);

  const pekerjaanList: Pekerjaan[] = useMemo(() => {
    return pekerjaanData || [];
  }, [pekerjaanData]);

  const { paginatedData, pagination, setPagination, pageCount } = useLocalPagination<Pekerjaan>(pekerjaanList);

  const handleAddData = () => {
    setEditingPekerjaan(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (pekerjaan: Pekerjaan) => {
    setEditingPekerjaan(pekerjaan);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingPekerjaan(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingPekerjaan(undefined);
  };

  const columns: ColumnDef<Pekerjaan>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Nama Pekerjaan',
      },
      {
        accessorKey: 'code',
        header: 'Kode',
      },
      {
        accessorKey: 'description',
        header: 'Deskripsi',
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const pekerjaan = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(pekerjaan)}
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
        data={paginatedData}
        exportFileName="data_pekerjaan"
        exportTitle="Data Pekerjaan"
        onAddData={handleAddData}
        addButtonLabel="Tambah Pekerjaan"
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingPekerjaan ? 'Edit Pekerjaan' : 'Tambah Pekerjaan Baru'}</DialogTitle>
            <DialogDescription>
              {editingPekerjaan ? 'Ubah detail pekerjaan ini.' : 'Isi detail untuk pekerjaan baru.'}
            </DialogDescription>
          </DialogHeader>
          <PekerjaanForm
            initialData={editingPekerjaan}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PekerjaanTable;