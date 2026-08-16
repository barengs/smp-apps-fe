import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetClassGroupStudentsQuery } from '@/store/slices/studentClassApi';
import type { Student } from '@/store/slices/studentApi';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';

interface ClassGroupStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classGroupId: number | null;
  classGroupName: string;
}

const ClassGroupStudentsModal: React.FC<ClassGroupStudentsModalProps> = ({
  isOpen,
  onClose,
  classGroupId,
  classGroupName,
}) => {
  const { data: students, isLoading, error } = useGetClassGroupStudentsQuery(classGroupId!, {
    skip: classGroupId === null,
  });

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: 'nis',
      header: 'NIS',
    },
    {
      accessorKey: 'nik',
      header: 'NIK',
    },
    {
      id: 'name',
      header: 'Nama Siswa',
      accessorFn: (row: Student) => `${row.first_name || ''} ${row.last_name || ''}`.trim(),
    },
    {
      accessorKey: 'gender',
      header: 'Jenis Kelamin',
      cell: ({ row }) => (row.original.gender === 'L' ? 'Laki-laki' : 'Perempuan'),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Daftar Siswa - Rombel: {classGroupName}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto py-4">
          {isLoading ? (
            <TableLoadingSkeleton numCols={4} />
          ) : error ? (
            <div className="text-red-500 text-center py-4">
              Gagal memuat data siswa.
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={students || []}
              exportFileName={`Siswa_Rombel_${classGroupName.replace(/\s+/g, '_')}`}
              exportTitle={`Data Siswa Rombel ${classGroupName}`}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClassGroupStudentsModal;
