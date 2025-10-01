import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import * as toast from '@/utils/toast';
import { DataTable } from '../../components/DataTable';
import { useGetParentsQuery } from '@/store/slices/parentApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';
import { useNavigate } from 'react-router-dom';

// Interface for the data displayed in the table
interface WaliSantri {
  id: number;
  fullName: string;
  email: string;
  kk: string;
  nik: string;
  gender: string;
  parentAs: string;
}

const WaliSantriTable: React.FC = () => {
  const { data: parentsData, error, isLoading } = useGetParentsQuery();
  const navigate = useNavigate();

  const waliSantriList: WaliSantri[] = useMemo(() => {
    if (parentsData?.data) {
      return parentsData.data.map(parent => ({
        id: parent.id,
        fullName: `${parent.parent.first_name} ${parent.parent.last_name || ''}`.trim(),
        email: parent.email,
        kk: parent.parent.kk,
        nik: parent.parent.nik,
        gender: parent.parent.gender === 'L' ? 'Laki-Laki' : parent.parent.gender === 'P' ? 'Perempuan' : 'Tidak Diketahui',
        parentAs: parent.parent.parent_as,
      }));
    }
    return [];
  }, [parentsData]);

  const handleRowClick = (wali: WaliSantri) => {
    navigate(`/dashboard/wali-santri/${wali.id}`);
  };

  const columns: ColumnDef<WaliSantri>[] = useMemo(
    () => [
      {
        accessorKey: 'fullName',
        header: 'Nama Wali',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'kk',
        header: 'No. KK',
      },
      {
        accessorKey: 'nik',
        header: 'NIK',
      },
      {
        accessorKey: 'gender',
        header: 'Jenis Kelamin',
      },
      {
        accessorKey: 'parentAs',
        header: 'Status Wali',
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const waliSantri = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  toast.showWarning(`Mengedit wali santri: ${waliSantri.fullName}`);
                }}
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
    toast.showWarning('Membuka form tambah data wali santri...');
    // Implementasi logika untuk membuka form tambah data wali santri
  };

  if (isLoading) return <TableLoadingSkeleton numCols={7} />;

  const isNotFound = error && (error as FetchBaseQueryError).status === 404;
  if (error && !isNotFound) {
    return <div>Error: Gagal memuat data wali santri.</div>;
  }

  return (
    <DataTable
      columns={columns}
      data={waliSantriList}
      exportFileName="data_wali_santri"
      exportTitle="Data Wali Santri Pesantren"
      onAddData={handleAddData}
      onRowClick={handleRowClick}
      addButtonLabel="Tambah Wali Santri"
    />
  );
};

export default WaliSantriTable;