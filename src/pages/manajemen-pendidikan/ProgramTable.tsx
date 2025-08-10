import React, { useMemo, useState } from 'react';
import { type ColumnDef, type Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, ChevronDown, ChevronRight } from 'lucide-react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Hostel {
  id: number;
  name: string;
  capacity: number;
}

interface Program {
  id: number;
  name: string;
  description: string;
  hostels?: Hostel[];
}

const ProgramTable: React.FC = () => {
  const { data: programsData, error, isLoading } = useGetProgramsQuery();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | undefined>(undefined);

  const programs: Program[] = useMemo(() => {
    return (programsData || []).map(p => ({
      ...p,
      description: p.description || 'Tidak ada deskripsi',
      hostels: p.hostels || [],
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

  const renderSubComponent = ({ row }: { row: Row<Program> }) => {
    const hostels = row.original.hostels;

    if (!hostels || hostels.length === 0) {
      return (
        <div className="p-4 text-center text-sm text-gray-500 bg-gray-50">
          Tidak ada data asrama untuk program ini.
        </div>
      );
    }

    return (
      <div className="p-4 bg-gray-50">
        <h4 className="font-bold mb-2 text-base">Daftar Asrama Terkait</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70%]">Nama Asrama</TableHead>
              <TableHead>Kapasitas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hostels.map((hostel) => (
              <TableRow key={hostel.id}>
                <TableCell>{hostel.name}</TableCell>
                <TableCell>{hostel.capacity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const columns: ColumnDef<Program>[] = useMemo(
    () => [
      {
        id: 'expander',
        header: () => null,
        cell: ({ row }) => {
          const hasHostels = row.original.hostels && row.original.hostels.length > 0;
          return hasHostels ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Expander clicked for row:', row.id); // Log untuk debugging
                row.getToggleExpandedHandler()();
              }}
              className="h-8 w-8"
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : null;
        },
      },
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
        renderSubComponent={renderSubComponent}
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