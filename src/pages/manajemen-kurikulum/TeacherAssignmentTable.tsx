import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
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
import { StaffDetailFromApi, Staff } from '@/types/teacherAssignment';
import * as toast from '@/utils/toast';
import { Badge } from '@/components/ui/badge';
import AssignStudyModal from './AssignStudyModal';

const TeacherAssignmentTable: React.FC = () => {
  const { data, error, isLoading } = useGetTeacherAssignmentsQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const handleOpenModal = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStaff(null);
  };

  const columns: ColumnDef<StaffDetailFromApi>[] = [
    {
      accessorKey: 'nik',
      header: 'NIP',
      cell: ({ row }) => row.original.nik || '-',
    },
    {
      accessorKey: 'first_name',
      header: 'Nama Guru',
      cell: ({ row }) => {
        const staff = row.original;
        return `${staff.first_name} ${staff.last_name}`;
      },
    },
    {
      accessorKey: 'studies',
      header: 'Mata Pelajaran',
      cell: ({ row }) => {
        const staffDetail = row.original;
        const studies = staffDetail.studies;

        const staffForModal: Staff = {
          id: staffDetail.id,
          first_name: staffDetail.first_name,
          last_name: staffDetail.last_name,
          nip: staffDetail.nik,
          email: staffDetail.email,
        };

        if (studies.length === 0) {
          return (
            <Button
              variant="outline"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={() => handleOpenModal(staffForModal)}
            >
              <PlusCircle className="mr-2 h-3 w-3" />
              Tugaskan Mapel
            </Button>
          );
        }

        return (
          <div className="flex flex-wrap gap-1">
            {studies.map((study) => (
              <Badge key={study.id} variant="outline">
                {study.name}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const staffDetail = row.original;
        const staffForModal: Staff = {
          id: String(staffDetail.id), // Convert number to string
          first_name: staffDetail.first_name,
          last_name: staffDetail.last_name,
          nip: staffDetail.nik,
          email: staffDetail.email,
        };

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
                  onClick={() => navigator.clipboard.writeText(staffDetail.user_id)}
                >
                  Salin ID Guru
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleOpenModal(staffForModal)}>
                  Ubah Mapel
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive">Hapus</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  if (error) {
    toast.showError('Gagal memuat data penugasan guru.');
    console.error('Error fetching teacher assignments:', error);
  }

  const tableData: StaffDetailFromApi[] = React.useMemo(() => {
    return data?.data || [];
  }, [data]);

  return (
    <>
      <DataTable
        columns={columns}
        data={tableData}
        isLoading={isLoading}
        exportFileName="penugasan_guru"
        exportTitle="Data Penugasan Guru"
        getRowId={(row) => String(row.id)}
      />
      <AssignStudyModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        staff={selectedStaff}
      />
    </>
  );
};

export default TeacherAssignmentTable;