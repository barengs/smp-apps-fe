import React, { useMemo, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, FileDown, Search, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from '@/components/ui/badge';
import {
  useGetEmployeesQuery,
  useDeleteEmployeeMutation,
} from '@/store/slices/employeeApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { DataTable } from '@/components/DataTable';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface Staff {
  id: number;
  employee: { // Nested employee object
    first_name: string;
    last_name: string;
  };
  email: string;
  roles: { id: number; name: string; guard_name: string }[];
  fullName: string; // Added for easier display and filtering
}

const StaffTable: React.FC = () => {
  const { data: employeesData, error, isLoading } = useGetEmployeesQuery();
  const [deleteEmployee] = useDeleteEmployeeMutation();
  const navigate = useNavigate(); // Initialize useNavigate

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | undefined>(undefined);

  const employees: Staff[] = useMemo(() => {
    if (employeesData?.data) {
      return employeesData.data.map(apiEmployee => ({
        id: apiEmployee.id,
        employee: {
          first_name: apiEmployee.employee.first_name,
          last_name: apiEmployee.employee.last_name,
        },
        email: apiEmployee.email,
        roles: apiEmployee.roles,
        fullName: `${apiEmployee.employee.first_name} ${apiEmployee.employee.last_name}`, // Create fullName
      }));
    }
    return [];
  }, [employeesData]);

  const handleAddData = () => {
    setEditingStaff(undefined);
    setIsModalOpen(true);
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
        toast.success(`Staf "${staffToDelete.fullName}" berhasil dihapus.`); // Use fullName for toast
        setStaffToDelete(undefined);
        setIsDeleteDialogOpen(false);
      } catch (err: unknown) {
        let errorMessage = 'Terjadi kesalahan tidak dikenal.';
        if (typeof err === 'object' && err !== null) {
          if ('status' in err) {
            const fetchError = err as FetchBaseQueryError;
            if (typeof fetchError.status === 'number') {
              if (fetchError.data && typeof fetchError.data === 'object' && 'message' in fetchError.data) {
                errorMessage = (fetchError.data as { message: string }).message;
              } else {
                errorMessage = `Error ${fetchError.status}: ${JSON.stringify(fetchError.data || {})}`;
              }
            } else if (typeof fetchError.status === 'string') {
              if ('error' in fetchError && typeof fetchError.error === 'string') {
                errorMessage = fetchError.error;
              } else {
                errorMessage = `Error: ${fetchError.status} - ${JSON.stringify(fetchError)}`;
              }
            } else {
              errorMessage = `Error: ${JSON.stringify(fetchError)}`;
            }
          } else if ('message' in err && typeof (err as SerializedError).message === 'string') {
            errorMessage = (err as SerializedError).message;
          } else {
            errorMessage = `Terjadi kesalahan: ${JSON.stringify(err)}`;
          }
        } else if (typeof err === 'string') {
          errorMessage = err;
        }
        toast.error(`Gagal menghapus staf: ${errorMessage}`);
      }
    }
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

  const columns: ColumnDef<Staff>[] = useMemo(
    () => [
      {
        accessorKey: 'fullName', // Use fullName for filtering/sorting
        header: 'Nama Lengkap',
        cell: ({ row }) => row.original.fullName, // Display fullName
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
                  e.stopPropagation(); // Prevent row click from firing
                  handleEditData(staff);
                }}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent row click from firing
                  handleDeleteClick(staff);
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Hapus
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  if (isLoading) return <div>Memuat data staf...</div>;
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
        onRowClick={handleRowClick} // Pass the new prop
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
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