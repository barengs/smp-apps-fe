import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetRolesQuery, useDeleteRoleMutation } from '@/store/slices/roleApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2, Search } from 'lucide-react';

import PermissionGate from '@/components/PermissionGate';
import { usePermission } from '@/hooks/usePermission';

export const RoleManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { getMenuByRoute } = usePermission();
  const menu = getMenuByRoute('/utility/roles');
  const menuId = menu?.id;

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);

  const { data: roles, isLoading, error } = useGetRolesQuery({
    search,
    sort_by: 'name',
    sort_order: 'asc',
  });

  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const filteredRoles = roles?.filter((role) => {
    if (categoryFilter && role.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  const handleDelete = async () => {
    if (!roleToDelete) return;

    try {
      await deleteRole(roleToDelete).unwrap();
      toast.success('Role berhasil dihapus');
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    } catch (error: any) {
      console.error('Error deleting role:', error);
      toast.error(error?.data?.message || 'Gagal menghapus role');
    }
  };

  const openDeleteDialog = (roleId: number) => {
    setRoleToDelete(roleId);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-destructive">
          Error loading roles. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">Kelola role dan permission untuk sistem</p>
        </div>
        {menuId && (
          <PermissionGate action="create" menuId={menuId}>
            <Button onClick={() => navigate('/utility/roles/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Role
            </Button>
          </PermissionGate>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={categoryFilter === '' ? 'primary' : 'outline'}
            onClick={() => setCategoryFilter('')}
          >
            Semua
          </Button>
          <Button
            variant={categoryFilter === 'pendidikan' ? 'primary' : 'outline'}
            onClick={() => setCategoryFilter('pendidikan')}
          >
            Pendidikan
          </Button>
          <Button
            variant={categoryFilter === 'administrasi' ? 'primary' : 'outline'}
            onClick={() => setCategoryFilter('administrasi')}
          >
            Administrasi
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Role</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Jumlah Menu</TableHead>
              <TableHead>Jumlah Permission</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!filteredRoles || filteredRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Tidak ada role ditemukan
                </TableCell>
              </TableRow>
            ) : (
              filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>
                    {role.category ? (
                      <Badge variant="secondary">{role.category}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{role.menus?.length || 0}</TableCell>
                  <TableCell>{role.permissions?.length || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {menuId && (
                        <>
                          <PermissionGate action="edit" menuId={menuId}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/utility/roles/${role.id}/edit`)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </PermissionGate>
                          <PermissionGate action="delete" menuId={menuId}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(role.id)}
                              disabled={role.name === 'superadmin'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </PermissionGate>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Role?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus role ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
