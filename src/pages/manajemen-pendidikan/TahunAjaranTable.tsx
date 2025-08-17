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
import TahunAjaranForm from './TahunAjaranForm';
import { useGetTahunAjaranQuery } from '@/store/slices/tahunAjaranApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';
import { Badge } from '@/components/ui/badge';

interface TahunAjaran {
  id: number;
  year: string;
  semester: string;
  active: boolean;
  description: string | null;
}

const TahunAjaranTable: React.FC = () => {
  const { data: tahunAjaranData, error, isLoading } = useGetTahunAjaranQuery();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTahunAjaran, setEditingTahunAjaran] = useState<TahunAjaran | undefined>(undefined);

  const tahunAjaranList: TahunAjaran[] = useMemo(() => {
    return (tahunAjaranData || []).map(p => ({
      ...p,
      description: p.description || 'Tidak ada deskripsi',
    }));
  }, [tahunAjaranData]);

  const handleAddData = () => {
    setEditingTahunAjaran(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (tahunAjaran: TahunAjaran) => {
    setEditingTahunAjaran(tahunAjaran);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingTahunAjaran(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingTahunAjaran(undefined);
  };

  const columns: ColumnDef<TahunAjaran>[] = useMemo(
    () => [
      {
        accessorKey: 'year',
        header: 'Tahun Ajaran',
      },
      {
        accessorKey: 'semester',
        header: 'Semester',
      },
      {
        accessorKey: 'active',
        header: 'Status',
        cell: ({ row }) => {
          const isActive = row.original.active;
          return (
            <Badge variant={isActive ? 'default' : 'destructive'}>
              {isActive ? 'Aktif' : 'Tidak Aktif'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'description',
        header: 'Deskripsi',
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const tahunAjaran = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(tahunAjaran)}
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

  if (isLoading) return <TableLoadingSkeleton numCols={5} />;

  const isNotFound = error && (error as FetchBaseQueryError).status === 404;
  if (error && !isNotFound) {
    return <div>Error: Gagal memuat data. Silakan coba lagi nanti.</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={tahunAjaranList}
        exportFileName="data_tahun_ajaran"
        exportTitle="Data Tahun Ajaran"
        onAddData={handleAddData}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingTahunAjaran ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}</DialogTitle>
            <DialogDescription>
              {editingTahunAjaran ? 'Ubah detail tahun ajaran ini.' : 'Isi detail untuk tahun ajaran baru.'}
            </DialogDescription>
          </DialogHeader>
          <TahunAjaranForm
            initialData={editingTahunAjaran as any}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TahunAjaranTable;