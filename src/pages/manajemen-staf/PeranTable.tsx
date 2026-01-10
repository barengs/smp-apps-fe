import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ChevronDown } from 'lucide-react';
import * as toast from '@/utils/toast';
import { DataTable } from '../../components/DataTable';
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
import PeranForm from './PeranForm';
import { Badge } from '@/components/ui/badge';
import {
  useGetRolesQuery,
  useDeleteRoleMutation,
} from '../../store/slices/roleApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLocalPagination } from '@/hooks/useLocalPagination';
import { useNavigate } from 'react-router-dom';
import RoleMenusCell from '@/components/RoleMenusCell';

interface Peran {
  id: number;
  roleName: string;
  description: string;
  usersCount: number;
  accessRights: string[];
  menus: { id: number; title: string }[];
}

const PeranTable: React.FC = () => {
  const { data: rolesData, error, isLoading } = useGetRolesQuery({});
  const [deleteRole] = useDeleteRoleMutation();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeran, setEditingPeran] = useState<Omit<Peran, 'menus'> | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [peranToDelete, setPeranToDelete] = useState<Peran | undefined>(undefined);

  const roles: Peran[] = useMemo(() => {
    if (rolesData && Array.isArray(rolesData)) {
      return rolesData.map(apiRole => ({
        id: apiRole.id,
        roleName: apiRole.name,
        description: '', // Kept for form data structure, though not displayed
        usersCount: 0, // Kept for form data structure
        accessRights: apiRole.permissions?.map(p => p.name) || [],
        menus: apiRole.menus || [],
      }));
    }
    return [];
  }, [rolesData]);

  // Gunakan pagination lokal agar kontrol halaman dan ukuran per halaman berfungsi konsisten
  const { paginatedData, pagination, setPagination, pageCount } = useLocalPagination<Peran>(roles);

  const handleAddData = () => {
    // NAVIGATE to add page
    navigate('/dashboard/peran/add');
  };

  const handleEditData = (peran: Peran) => {
    // NAVIGATE to edit page with id
    navigate(`/dashboard/peran/${peran.id}/edit`);
  };

  const handleDeleteClick = (peran: Peran) => {
    setPeranToDelete(peran);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (peranToDelete) {
      try {
        await deleteRole(peranToDelete.id).unwrap();
        toast.showSuccess(`Peran "${peranToDelete.roleName}" berhasil dihapus.`);
        setPeranToDelete(undefined);
        setIsDeleteDialogOpen(false);
      } catch (err: any) {
        let errorMessage = 'Terjadi kesalahan tidak dikenal.';
        if (typeof err === 'object' && err !== null) {
          if ('data' in err && err.data && typeof err.data === 'object' && 'message' in err.data) {
            errorMessage = (err.data as { message: string }).message;
          } else if ('error' in err && typeof err.error === 'string') {
            errorMessage = err.error;
          } else if ('message' in err && typeof err.message === 'string') {
            errorMessage = err.message;
          }
        }
        toast.showError(`Gagal menghapus peran: ${errorMessage}`);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingPeran(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingPeran(undefined);
  };

  const columns: ColumnDef<Peran>[] = useMemo(
    () => [
      {
        accessorKey: 'roleName',
        header: 'Nama Peran',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'menus',
        header: 'Menu',
        cell: ({ row }) => <RoleMenusCell roleId={row.original.id} />,
      },
      {
        accessorKey: 'accessRights',
        header: 'Hak Akses',
        cell: ({ row }) => {
          const rights = row.original.accessRights;
          if (!rights || rights.length === 0) {
            return <span className="text-muted-foreground">-</span>;
          }

          if (rights.length === 1) {
            return <Badge variant="outline">{rights[0]}</Badge>;
          }

          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {rights.length} Hak Akses
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <div className="space-y-1">
                  {rights.map((right, index) => (
                    <Badge key={index} variant="secondary" className="block w-full text-left font-normal whitespace-normal">
                      {right}
                    </Badge>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          );
        },
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const peran = row.original;
          const isProtectedRole = peran.roleName === 'superadmin' || peran.roleName === 'orangtua';
          const isDeletable = peran.roleName !== 'superadmin' && peran.roleName !== 'orangtua';
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditData(peran);
                }}
                disabled={false}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="danger"
                className="h-8 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(peran);
                }}
                disabled={!isDeletable}
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

  if (isLoading) return <TableLoadingSkeleton numCols={4} />;
  if (error) {
    let errorMessage = 'Terjadi kesalahan saat memuat data.';
    if (typeof error === 'object' && error !== null) {
      if ('status' in error) {
        if (typeof (error as FetchBaseQueryError).data === 'object' && (error as FetchBaseQueryError).data !== null && 'message' in ((error as FetchBaseQueryError).data as object)) {
          errorMessage = ((error as FetchBaseQueryError).data as { message: string }).message;
        } else {
          errorMessage = `Error ${(error as FetchBaseQueryError).status}: ${JSON.stringify((error as FetchBaseQueryError).data)}`;
        }
      } else if ('message' in error) {
        errorMessage = (error as { message: string }).message;
      }
    }
    return <div>Error: {errorMessage}</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
        exportFileName="data_peran"
        exportTitle="Data Peran"
        onAddData={handleAddData}
        addButtonLabel="Tambah Peran"
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        onRowClick={(peran) => navigate(`/dashboard/peran/${peran.id}`)}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus peran{' '}
              <span className="font-semibold text-foreground">"{peranToDelete?.roleName}"</span> secara permanen.
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

export default PeranTable;