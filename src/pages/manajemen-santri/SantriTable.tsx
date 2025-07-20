import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '../../components/DataTable';
import { useGetStudentsQuery } from '@/store/slices/studentApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

// Interface for the data displayed in the table
interface Santri {
  id: number;
  fullName: string;
  nis: string;
  nik: string;
  period: string;
  gender: string;
  status: string;
  programName: string;
}

const SantriTable: React.FC = () => {
  const { data: studentsData, error, isLoading } = useGetStudentsQuery();

  const santriList: Santri[] = useMemo(() => {
    if (studentsData?.data) {
      return studentsData.data.map(student => ({
        id: student.id,
        fullName: `${student.first_name} ${student.last_name || ''}`.trim(),
        nis: student.nis,
        nik: student.nik,
        period: student.period,
        gender: student.gender === 'L' ? 'Laki-Laki' : student.gender === 'P' ? 'Perempuan' : 'Tidak Diketahui',
        status: student.status,
        programName: student.program.name,
      }));
    }
    return [];
  }, [studentsData]);

  const columns: ColumnDef<Santri>[] = useMemo(
    () => [
      {
        accessorKey: 'fullName',
        header: 'Nama Lengkap',
      },
      {
        accessorKey: 'nis',
        header: 'NIS',
      },
      {
        accessorKey: 'nik',
        header: 'NIK',
      },
      {
        accessorKey: 'period',
        header: 'Periode',
      },
      {
        accessorKey: 'gender',
        header: 'Jenis Kelamin',
      },
      {
        accessorKey: 'status',
        header: 'Status',
      },
      {
        accessorKey: 'programName',
        header: 'Program',
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const santri = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => toast.info(`Mengedit santri: ${santri.fullName}`)}
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

  const handleAddData = () => {
    toast.info('Membuka form tambah data santri...');
    // Logic to open add student form will be implemented later
  };

  if (isLoading) return <div>Memuat data santri...</div>;

  const isNotFound = error && (error as FetchBaseQueryError).status === 404;
  if (error && !isNotFound) {
    return <div>Error: Gagal memuat data santri.</div>;
  }

  return (
    <DataTable
      columns={columns}
      data={santriList}
      exportFileName="data_santri"
      exportTitle="Data Santri Pesantren"
      onAddData={handleAddData}
    />
  );
};

export default SantriTable;