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
import { TeacherAssignment } from '@/types/teacherAssignment';
import * as toast from '@/utils/toast';
import { Badge } from '@/components/ui/badge';

const columns: ColumnDef<TeacherAssignment>[] = [
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
                onClick={() => navigator.clipboard.writeText(String(assignment.id))}
              >
                Salin ID
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

  const tableData = data?.data || [];

  return (
    <DataTable
      columns={columns}
      data={tableData}
      isLoading={isLoading}
      exportFileName="penugasan_guru"
      exportTitle="Data Penugasan Guru"
      filterableColumns={{
        'study.name': {
          placeholder: 'Filter mata pelajaran...',
        },
      }}
    />
  );
};

export default TeacherAssignmentTable;