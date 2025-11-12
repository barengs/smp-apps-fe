import React, { useMemo, useState } from 'react'; // Import useState
import { ColumnDef, SortingState, PaginationState } from '@tanstack/react-table'; // Import PaginationState
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import * as toast from '@/utils/toast';
import { DataTable } from '../../components/DataTable';
import { useGetStudentsQuery } from '@/store/slices/studentApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';
import { useNavigate } from 'react-router-dom';
import { useLocalPagination } from '@/hooks/useLocalPagination';

// Interface for the data displayed in the table
interface Santri {
  id: number;
  fullName: string;
  nis: string;
  roomName: string;
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
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }]);

  // Ambil semua data tanpa server-side pagination
  const { data: students, error, isLoading, isFetching } = useGetStudentsQuery({});

  const santriList: Santri[] = useMemo(() => {
    if (Array.isArray(students)) {
      const mapped = students.map((student) => ({
        id: student.id,
        fullName: `${student.first_name} ${student.last_name || ''}`.trim(),
        nis: student.nis,
        // Ambil nama kamar dari properti hostel.name, fallback ke 'Belum diatur'
        roomName: student.hostel?.name ?? 'Belum diatur',
        period: student.period,
        gender:
          student.gender === 'L'
            ? 'Laki-Laki'
            : student.gender === 'P'
            ? 'Perempuan'
            : 'Tidak Diketahui',
        status: student.status,
        programName: student.program ? student.program.name : '',
        created_at: student.created_at,
        updated_at: student.updated_at,
      }));
      // Urutkan berdasarkan tanggal dibuat (terbaru di atas)
      mapped.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      return mapped;
    }
    return [];
  }, [students]);

  // Tambah opsi filter unik untuk Periode, Status, dan Program
  const periodOptions = useMemo(
    () => {
      const set = new Set<string>();
      santriList.forEach(s => { if (s.period) set.add(s.period); });
      return Array.from(set).map(v => ({ label: v, value: v }));
    },
    [santriList]
  );

  const statusOptions = useMemo(
    () => {
      const set = new Set<string>();
      santriList.forEach(s => { if (s.status) set.add(s.status); });
      return Array.from(set).map(v => ({ label: v, value: v }));
    },
    [santriList]
  );

  const programOptions = useMemo(
    () => {
      const set = new Set<string>();
      santriList.forEach(s => { if (s.programName) set.add(s.programName); });
      return Array.from(set).map(v => ({ label: v, value: v }));
    },
    [santriList]
  );

  // Pagination client-side
  const { paginatedData, pagination, setPagination, pageCount } = useLocalPagination(santriList, 10);

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
      // Program dipindahkan ke sebelah kiri kolom Kamar
      {
        accessorKey: 'programName',
        header: 'Program',
      },
      {
        accessorKey: 'roomName',
        header: 'Kamar',
        cell: ({ row }) => (
          <span className={row.original.roomName === 'Belum diatur' ? 'text-muted-foreground' : ''}>
            {row.original.roomName || 'Belum diatur'}
          </span>
        ),
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
        accessorKey: 'updated_at',
        header: 'Terakhir Diperbarui',
        cell: ({ row }) => {
          const date = new Date(row.original.updated_at);
          return date.toLocaleString('id-ID');
        },
        enableSorting: true,
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
                  navigate(`/dashboard/santri/${santri.id}/edit`);
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

  if (isLoading || isFetching) return <TableLoadingSkeleton numCols={8} />;

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
        period: { type: 'select', placeholder: 'Periode', options: periodOptions },
        status: { type: 'select', placeholder: 'Status', options: statusOptions },
        programName: { type: 'select', placeholder: 'Program', options: programOptions },
      }}
      onAddData={onAddData}
      sorting={sorting}
      onSortingChange={setSorting}
      pagination={pagination}
      onPaginationChange={setPagination}
      pageCount={pageCount}
      addButtonLabel="Tambah Santri"
    />
  );
};

export default SantriTable;