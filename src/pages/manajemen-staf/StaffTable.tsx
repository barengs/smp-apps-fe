import React, { useMemo, useState } from 'react';
import {
  ColumnDef,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import * as toast from '@/utils/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
// import StaffForm from './StaffForm'; // Dihapus
import { Badge } from '@/components/ui/badge';
import {
  useGetEmployeesQuery,
} from '@/store/slices/employeeApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { DataTable } from '@/components/DataTable';
import { useNavigate } from 'react-router-dom';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';
// import StaffImportDialog from './StaffImportDialog'; // Dihapus

interface Staff {
  id: number;
  employee: {
    first_name: string;
    last_name: string;
    code: string; // Added
    nik: string; // Added
    phone: string; // Added
    address: string; // Added
    zip_code: string; // Added
  };
  email: string;
  roles: { id: number; name: string; guard_name: string }[];
  fullName: string;
}

const StaffTable: React.FC = () => {
  const { data: employeesData, error, isLoading, refetch } = useGetEmployeesQuery();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | undefined>(undefined);
  // const [isImportDialogOpen, setIsImportDialogOpen] = useState(false); // Dihapus

  const employees: Staff[] = useMemo(() => {
    if (employeesData?.data) {
      return employeesData.data.map(apiEmployee => ({
        id: apiEmployee.id,
        employee: {
          first_name: apiEmployee.employee.first_name,
          last_name: apiEmployee.employee.last_name,
          code: apiEmployee.employee.code, // Mapped
          nik: apiEmployee.employee.nik, // Mapped
          phone: apiEmployee.employee.phone, // Mapped
          address: apiEmployee.employee.address, // Mapped
          zip_code: apiEmployee.employee.zip_code, // Mapped
        },
        email: apiEmployee.email,
        roles: apiEmployee.roles,
        fullName: `${apiEmployee.employee.first_name} ${apiEmployee.employee.last_name}`,
      }));
    }
    return [];
  }, [employeesData]);

  const handleAddData = () => {
    // setEditingStaff(undefined); // Dihapus
    // setIsModalOpen(true); // Dihapus
    toast.showWarning('Fitur tambah staf saat ini dinonaktifkan.');
  };

  const handleEditData = (staff: Staff) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingStaff(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingStaff(undefined);
  };

  const handleRowClick = (staff: Staff) => {
    navigate(`/dashboard/staf/${staff.id}`);
  };

  // const handleImportSuccess = () => { // Dihapus
  //   setIsImportDialogOpen(false);
  //   refetch();
  // }; // Dihapus

  const columns: ColumnDef<Staff>[] = useMemo(
    () => [
      {
        accessorKey: 'fullName',
        header: 'Nama Lengkap',
        cell: ({ row }) => row.original.fullName,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'roles',
        header: 'Peran',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.roles.map((role) => (
              <Badge key={role.id} variant="outline" className="text-xs">
                {role.name}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const staff = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditData(staff);
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

  if (isLoading) return <TableLoadingSkeleton numCols={4} />;
  if (error) {
    let errorMessage = 'Terjadi kesalahan saat memuat data.';
    if (typeof error === 'object' && error !== null) {
      if ('status' in error) {
        if (typeof (error as FetchBaseQueryError).status === 'number') {
          const fetchError = error as FetchBaseQueryError;
          if (fetchError.data && typeof fetchError.data === 'object' && 'message' in fetchError.data) {
            errorMessage = (fetchError.data as { message: string }).message;
          } else {
            errorMessage = `Error ${fetchError.status}: ${JSON.stringify(fetchError.data || {})}`;
          }
        } else if (typeof (error as FetchBaseQueryError).status === 'string') {
          if ('error' in error && typeof error.error === 'string') {
            errorMessage = error.error;
          } else {
            errorMessage = `Error: ${error.status} - ${JSON.stringify(error)}`;
          }
        } else {
          errorMessage = `Terjadi kesalahan: ${JSON.stringify(error)}`;
        }
      } else if ('message' in error && typeof (error as SerializedError).message === 'string') {
        errorMessage = (error as SerializedError).message;
      } else {
        errorMessage = `Terjadi kesalahan: ${JSON.stringify(error)}`;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    toast.showError(errorMessage); // Display error using toast
    return <div>Error: {errorMessage}</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={employees}
        exportFileName="data_staf"
        exportTitle="Data Staf Pesantren"
        onAddData={handleAddData}
        // onImportData={() => setIsImportDialogOpen(true)} // Dihapus
        onRowClick={handleRowClick}
      />

      {/* <StaffImportDialog // Dihapus
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onSuccess={handleImportSuccess}
      /> */}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingStaff ? 'Edit Staf' : 'Tambah Staf Baru'}</DialogTitle>
            <DialogDescription>
              {editingStaff ? 'Ubah detail staf ini.' : 'Isi detail untuk staf baru.'}
            </DialogDescription>
          </DialogHeader>
          {/* StaffForm akan tetap ada untuk fungsi edit, tetapi tidak untuk tambah baru */}
          {/* Jika Anda ingin menghapus fungsi edit juga, StaffForm perlu dihapus sepenuhnya */}
          {/* Untuk saat ini, saya asumsikan Anda hanya ingin menonaktifkan penambahan baru */}
          {/* Jika editingStaff ada, tampilkan form edit. Jika tidak, tampilkan pesan atau kosongkan. */}
          {editingStaff ? (
            <p className="text-center text-muted-foreground py-8">
              Fitur edit staf akan segera tersedia.
            </p>
            // <StaffForm // Jika ingin mengaktifkan kembali edit, uncomment ini
            //   key={editingStaff?.id || 'new-staff-form'}
            //   initialData={editingStaff}
            //   onSuccess={handleFormSuccess}
            //   onCancel={handleFormCancel}
            // />
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Formulir tambah staf saat ini dinonaktifkan.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StaffTable;