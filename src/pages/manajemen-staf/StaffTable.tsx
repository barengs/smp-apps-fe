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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import StaffForm from './StaffForm';
import StaffImportDialog from './StaffImportDialog';
import { Badge } from '@/components/ui/badge';
import {
  useGetEmployeesQuery,
  useDeleteEmployeeMutation,
} from '@/store/slices/employeeApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { DataTable } from '@/components/DataTable';
import { useNavigate } from 'react-router-dom';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';

interface Staff {
  id: number;
  staff: {
    first_name: string;
    last_name: string;
    code: string;
    nik: string;
    phone: string;
    address: string;
    zip_code: string;
  };
  email: string;
  roles: { id: number; name: string; guard_name: string }[];
  fullName: string;
  username: string;
}

const StaffTable: React.FC = () => {
  const { data: employeesData, error, isLoading } = useGetEmployeesQuery();
  const [deleteEmployee] = useDeleteEmployeeMutation();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | undefined>(undefined);

  const staffData: Staff[] = useMemo(() => {
    if (employeesData?.data) {
      return employeesData.data.map(apiEmployee => {
        // Data is in apiEmployee.staff property
        const staffData = apiEmployee.staff;
        return {
          id: apiEmployee.id,
          staff: {
            first_name: staffData.first_name || '',
            last_name: staffData.last_name || '',
            code: staffData.code || '',
            nik: staffData.nik || '',
            phone: staffData.phone || '',
            address: staffData.address || '',
            zip_code: staffData.zip_code || '',
          },
          email: staffData.email || '', // Use email from staff object
          roles: apiEmployee.roles || [], // Roles are directly in apiEmployee.roles
          fullName: `${staffData.first_name || ''} ${staffData.last_name || ''}`,
          username: apiEmployee.name || '', // Username is in apiEmployee.name
        };
      });
    }
    return [];
  }, [employeesData]);

  const handleAddData = () => {
    setEditingStaff(undefined);
    setIsModalOpen(true);
  };

  const handleImportData = () => {
    setIsImportModalOpen(true);
  };

  const handleEditData = (staff: Staff) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (staff: Staff) => {
    setStaffToDelete(staff);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (staffToDelete) {
      try {
        await deleteEmployee(staffToDelete.id).unwrap();
        toast.showSuccess(`Staf "${staffToDelete.fullName}" berhasil dihapus.`);
      } catch (err) {
        const fetchError = err as FetchBaseQueryError;
        const errorMessage = (fetchError.data as { message?: string })?.message || 'Gagal menghapus staf.';
        toast.showError(errorMessage);
      } finally {
        setStaffToDelete(undefined);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingStaff(undefined);
  };

  const handleImportSuccess = () => {
    setIsImportModalOpen(false);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingStaff(undefined);
  };

  const handleRowClick = (staff: Staff) => {
    navigate(`/dashboard/staf/${staff.id}`);
  };

  const columns: ColumnDef<Staff>[] = useMemo(
    () => [
      {
        accessorFn: row => row.staff.code,
        id: 'code',
        header: 'Kode Staf',
      },
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

  if (isLoading) return <TableLoadingSkeleton numCols={5} />;
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
        errorMessage = error.message;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    toast.showError(errorMessage);
    return <div>Error: {errorMessage}</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={staffData}
        exportFileName="data_staf"
        exportTitle="Data Staf"
        onAddData={handleAddData}
        onImportData={handleImportData}
        addButtonLabel="Tambah Staf"
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStaff ? 'Edit Staf' : 'Tambah Staf Baru'}</DialogTitle>
            <DialogDescription>
              {editingStaff ? 'Ubah detail staf ini.' : 'Isi detail untuk staf baru.'}
            </DialogDescription>
          </DialogHeader>
          <StaffForm
            initialData={editingStaff}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      <StaffImportDialog
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onSuccess={handleImportSuccess}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus staf{' '}
              <span className="font-semibold text-foreground">"{staffToDelete?.fullName}"</span> secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Lanjutkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StaffTable;