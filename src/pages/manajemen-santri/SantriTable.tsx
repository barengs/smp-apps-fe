import React, { useMemo, useState } from 'react'; // Import useState
import { ColumnDef, SortingState, PaginationState } from '@tanstack/react-table'; // Import SortingState and PaginationState
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import * as toast from '@/utils/toast';
import { DataTable } from '../../components/DataTable';
import { useGetStudentsQuery } from '@/store/slices/studentApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';
import { useNavigate } from 'react-router-dom';

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
  created_at: string; // Tambahkan created_at
  updated_at: string; // Tambahkan updated_at
}

interface SantriTableProps {
  onAddData?: () => void;
}

const SantriTable: React.FC<SantriTableProps> = ({ onAddData }) => {
  const { data: studentsData, error, isLoading } = useGetStudentsQuery();
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'updated_at', desc: true }]); // Atur pengurutan default
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

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
        programName: student.program ? student.program.name : '', // Perbaikan di sini
        created_at: student.created_at, // Petakan created_at
        updated_at: student.updated_at, // Petakan updated_at
      }));
    }
    return [];
  }, [studentsData]);

  const handleRowClick = (santri: Santri) => {
    navigate(`/dashboard/santri/${santri.id}`);
  };

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
        accessorKey: 'updated_at', // Tambahkan kolom updated_at
        header: 'Terakhir Diperbarui',
        cell: ({ row }) => {
          const date = new Date(row.original.updated_at);
          return date.toLocaleString('id-ID'); // Format tanggal untuk tampilan
        },
        enableSorting: true, // Aktifkan pengurutan untuk kolom ini
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
                onClick={(e) => {
                  e.stopPropagation();
                  toast.showWarning('Fitur edit santri akan segera tersedia.');
                }}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
          );
        },
      },
    ],
    [navigate]
  );

  if (isLoading) return <TableLoadingSkeleton numCols={8} />;

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
      onRowClick={handleRowClick}
      filterableColumns={{
        programName: {
          placeholder: 'Filter berdasarkan program...',
        },
      }}
      onAddData={onAddData}
      sorting={sorting}
      onSortingChange={setSorting}
      pagination={pagination}
      onPaginationChange={setPagination}
      addButtonLabel="Tambah Santri"
    />
  );
};

export default SantriTable;