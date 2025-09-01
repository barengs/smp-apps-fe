import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/DataTable';
import { useGetTeacherAssignmentsQuery } from '@/store/slices/teacherAssignmentApi';
import { TeacherAssignmentRow, StaffDetailFromApi, Staff, Study } from '@/types/teacherAssignment';
import * as toast from '@/utils/toast';
import { Badge } from '@/components/ui/badge';

const columns: ColumnDef<TeacherAssignmentRow>[] = [
  {
    accessorKey: 'staff.nip',
    header: 'NIP',
    cell: ({ row }) => row.original.staff.nip || '-',
  },
  {
    accessorKey: 'staff.first_name',
    header: 'Nama Guru',
    cell: ({ row }) => {
      const staff = row.original.staff;
      return `${staff.first_name} ${staff.last_name}`;
    },
  },
  {
    accessorKey: 'study.name',
    header: 'Mata Pelajaran',
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.study.name}</Badge>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const assignment = row.original;

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(String(assignment.staff.id))}
              >
                Salin ID Guru
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Ubah</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive">Hapus</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

const TeacherAssignmentTable: React.FC = () => {
  const { data, error, isLoading } = useGetTeacherAssignmentsQuery();

  if (error) {
    toast.showError('Gagal memuat data penugasan guru.');
    console.error('Error fetching teacher assignments:', error);
  }

  // Meratakan data: setiap staf dengan mata pelajaran yang diajarkan akan menjadi baris terpisah
  // Jika staf tidak memiliki mata pelajaran, tetap tampilkan staf dengan indikasi 'Tidak ada mata pelajaran'
  const flattenedData: TeacherAssignmentRow[] = React.useMemo(() => {
    if (!data?.data) return [];
    return data.data.flatMap((staffDetail: StaffDetailFromApi) => {
      const staffInfo: Staff = {
        id: staffDetail.user_id,
        first_name: staffDetail.first_name,
        last_name: staffDetail.last_name,
        nip: staffDetail.nik,
        email: staffDetail.email,
      };

      if (staffDetail.studies.length === 0) {
        // Jika tidak ada mata pelajaran, tambahkan satu baris dengan placeholder
        return [{
          staff: staffInfo,
          study: { id: 0, name: 'Tidak ada mata pelajaran', description: null },
        }];
      } else {
        // Jika ada mata pelajaran, buat baris untuk setiap mata pelajaran
        return staffDetail.studies.map((study: Study) => ({
          staff: staffInfo,
          study: study,
        }));
      }
    });
  }, [data]);

  return (
    <DataTable
      columns={columns}
      data={flattenedData}
      isLoading={isLoading}
      exportFileName="penugasan_guru"
      exportTitle="Data Penugasan Guru"
      filterableColumns={{
        'study.name': {
          placeholder: 'Filter mata pelajaran...',
        },
      }}
      getRowId={(row) => `${row.staff.id}-${row.study.id}`} // Memberikan ID unik untuk setiap baris
    />
  );
};

export default TeacherAssignmentTable;