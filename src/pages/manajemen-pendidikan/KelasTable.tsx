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
import KelasForm from './KelasForm';
import { useGetClassroomsQuery } from '@/store/slices/classroomApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';

interface Kelas {
  id: number;
  name: string;
  description: string;
}

const KelasTable: React.FC = () => {
  const { data: classroomsData, error, isLoading } = useGetClassroomsQuery();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | undefined>(undefined);

  const classrooms: Kelas[] = useMemo(() => {
    return (classroomsData || []).map(c => ({
      ...c,
      description: c.description || 'Tidak ada deskripsi',
    }));
  }, [classroomsData]);

  const handleAddData = () => {
    setEditingKelas(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (kelas: Kelas) => {
    setEditingKelas(kelas);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingKelas(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingKelas(undefined);
  };

  const columns: ColumnDef<Kelas>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Nama Kelas',
      },
      {
        accessorKey: 'description',
        header: 'Deskripsi',
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const kelas = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(kelas)}
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

  if (isLoading) return <TableLoadingSkeleton numCols={3} />;

  const isNotFound = error && (error as FetchBaseQueryError).status === 404;
  if (error && !isNotFound) {
    return <div>Error: Gagal memuat data. Silakan coba lagi nanti.</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={classrooms}
        exportFileName="data_kelas"
        exportTitle="Data Kelas"
        onAddData={handleAddData}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingKelas ? 'Edit Kelas' : 'Tambah Kelas Baru'}</DialogTitle>
            <DialogDescription>
              {editingKelas ? 'Ubah detail kelas ini.' : 'Isi detail untuk kelas baru.'}
            </DialogDescription>
          </DialogHeader>
          <KelasForm
            initialData={editingKelas}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KelasTable;