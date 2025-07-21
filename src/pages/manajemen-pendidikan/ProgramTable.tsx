import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '../../components/DataTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ProgramForm from './ProgramForm';
import { useGetProgramsQuery } from '@/store/slices/programApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';

interface Program {
  id: number;
  name: string;
  description: string;
}

const ProgramTable: React.FC = () => {
  const { data: programsData, error, isLoading } = useGetProgramsQuery();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | undefined>(undefined);

  const programs: Program[] = useMemo(() => {
    // The API now returns a direct array
    return (programsData || []).map(p => ({
      ...p,
      description: p.description || 'Tidak ada deskripsi',
    }));
  }, [programsData]);

  const handleAddData = () => {
    setEditingProgram(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (program: Program) => {
    setEditingProgram(program);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingProgram(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingProgram(undefined);
  };

  const columns: ColumnDef<Program>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Nama Program',
      },
      {
        accessorKey: 'description',
        header: 'Deskripsi',
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const program = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(program)}
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
        data={programs}
        exportFileName="data_program"
        exportTitle="Data Program Pendidikan"
        onAddData={handleAddData}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingProgram ? 'Edit Program' : 'Tambah Program Baru'}</DialogTitle>
            <DialogDescription>
              {editingProgram ? 'Ubah detail program ini.' : 'Isi detail untuk program baru.'}
            </DialogDescription>
          </DialogHeader>
          <ProgramForm
            initialData={editingProgram}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProgramTable;