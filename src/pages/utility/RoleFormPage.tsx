import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetMenuQuery } from '@/store/slices/menuApi';
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useGetRoleByIdQuery,
  useGetPermissionMatrixQuery,
  useSyncPermissionMatrixMutation,
  PermissionMatrixItem,
} from '@/store/slices/roleApi';
import { PermissionMatrix } from '@/components/role/PermissionMatrix';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';

export const RoleFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrixItem[]>([]);

  // API hooks
  const { data: menuData, isLoading: isLoadingMenus } = useGetMenuQuery();
  const { data: roleData, isLoading: isLoadingRole } = useGetRoleByIdQuery(Number(id), {
    skip: !isEditMode,
  });
  const { data: matrixData, isLoading: isLoadingMatrix } = useGetPermissionMatrixQuery(Number(id), {
    skip: !isEditMode,
  });

  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [syncMatrix, { isLoading: isSyncing }] = useSyncPermissionMatrixMutation();

  const isLoading = isLoadingMenus || isLoadingRole || isLoadingMatrix;
  const isSaving = isCreating || isUpdating || isSyncing;

  // Load role data in edit mode
  useEffect(() => {
    if (isEditMode && roleData) {
      setName(roleData.name);
      setCategory(roleData.category || '');
      // Description is not in the current RoleApiResponse, so we skip it
    }
  }, [isEditMode, roleData]);

  // Load permission matrix in edit mode
  useEffect(() => {
    if (isEditMode && matrixData) {
      const matrix: PermissionMatrixItem[] = matrixData.matrix.map((item) => ({
        menu_id: item.menu_id,
        permissions: item.permissions,
        custom_permissions: item.custom_permissions,
      }));
      setPermissionMatrix(matrix);
    }
  }, [isEditMode, matrixData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.error('Nama role harus diisi');
      return;
    }

    if (permissionMatrix.length === 0) {
      toast.error('Minimal 1 menu dengan permission harus dipilih');
      return;
    }

    try {
      let roleId: number;

      if (isEditMode) {
        // Update existing role
        const result = await updateRole({
          id: Number(id),
          data: {
            name,
            guard_name: 'api',
            category: category || undefined,
          },
        }).unwrap();
        roleId = result.id;
      } else {
        // Create new role
        const result = await createRole({
          name,
          guard_name: 'api',
          category: category || undefined,
        }).unwrap();
        roleId = result.id;
      }

      // Sync permission matrix
      await syncMatrix({
        roleId,
        data: { matrix: permissionMatrix },
      }).unwrap();

      toast.success(`Role ${isEditMode ? 'diperbarui' : 'dibuat'} dengan sukses`);

      navigate('/utility/roles');
    } catch (error: any) {
      console.error('Error saving role:', error);
      toast.error(error?.data?.message || `Gagal ${isEditMode ? 'memperbarui' : 'membuat'} role`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/utility/roles')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEditMode ? 'Edit Role' : 'Tambah Role'}</h1>
          <p className="text-muted-foreground">
            {isEditMode ? 'Perbarui informasi role dan permission matrix' : 'Buat role baru dengan permission matrix'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
            <CardDescription>Isi informasi dasar tentang role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nama Role <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: admin, asatidz, walikelas"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tidak ada</SelectItem>
                    <SelectItem value="pendidikan">Pendidikan</SelectItem>
                    <SelectItem value="administrasi">Administrasi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi singkat tentang role ini (opsional)"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Permission Matrix Card */}
        <Card>
          <CardHeader>
            <CardTitle>Permission Matrix</CardTitle>
            <CardDescription>
              Pilih menu dan permission yang dapat diakses oleh role ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            {menuData?.data ? (
              <PermissionMatrix
                menus={menuData.data}
                value={permissionMatrix}
                onChange={setPermissionMatrix}
              />
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Tidak ada menu tersedia
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/utility/roles')}
            disabled={isSaving}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Simpan Perubahan' : 'Buat Role'}
          </Button>
        </div>
      </form>
    </div>
  );
};
