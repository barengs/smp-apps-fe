import React, { useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import * as toast from '@/utils/toast';
import { useCreateRoleMutation, useUpdateRoleMutation, useAssignRoleMenusMutation } from '../../store/slices/roleApi';
import { useGetMenuQuery, type MenuItem } from '@/store/slices/menuApi';
import { useGetPermissionsQuery } from '@/store/slices/permissionApi';
import MenuTreeView from '@/components/MenuTreeView';
import MultiSelect, { type Option } from '@/components/MultiSelect';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Nama Peran harus minimal 2 karakter.',
  }),
  description: z.string().optional(),
  menuAccess: z.array(z.string()).optional(),
  explicitPermissions: z.array(z.string()).optional(),
});

interface PeranFormProps {
  initialData?: {
    id: number;
    roleName: string;
    description: string;
    usersCount: number;
    accessRights: string[];
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const PeranForm: React.FC<PeranFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [assignRoleMenus] = useAssignRoleMenusMutation();
  const { data: menuData, isLoading: isLoadingMenu } = useGetMenuQuery();
  const { data: permissionsData, isLoading: isLoadingPermissions } = useGetPermissionsQuery({});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.roleName || '',
      description: initialData?.description || '',
      menuAccess: [],
      explicitPermissions: [],
    },
  });

  // Pisahkan initialData.accessRights menjadi menuAccess dan explicitPermissions saat data sudah siap
  useEffect(() => {
    if (initialData && menuData?.data && Array.isArray(permissionsData)) {
      // Kumpulkan semua id_title menu untuk validasi cepat
      const collectIdTitles = (items: MenuItem[], acc = new Set<string>()) => {
        items.forEach((item) => {
          if (item.id_title) acc.add(item.id_title);
          if (item.child?.length) collectIdTitles(item.child, acc);
        });
        return acc;
      };
      const menuIdTitleSet = collectIdTitles(menuData.data);
      const permissionNameSet = new Set(permissionsData.map((p) => p.name));

      const explicitPerms: string[] = [];
      const menuAccessIds: string[] = [];
      (initialData.accessRights || []).forEach((right) => {
        if (permissionNameSet.has(right)) {
          explicitPerms.push(right);
        } else if (menuIdTitleSet.has(right)) {
          menuAccessIds.push(right);
        }
      });

      form.setValue('explicitPermissions', explicitPerms);
      form.setValue('menuAccess', menuAccessIds);
    } else if (!initialData) {
      form.reset({
        name: '',
        description: '',
        menuAccess: [],
        explicitPermissions: [],
      });
    }
  }, [initialData, menuData, permissionsData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const getMenuIdsFromIdTitles = (idTitles: string[], menuItems: MenuItem[]): number[] => {
      const ids: number[] = [];
      const idTitleSet = new Set(idTitles);

      const traverse = (items: MenuItem[]) => {
        for (const item of items) {
          if (idTitleSet.has(item.id_title)) {
            ids.push(item.id);
          }
          if (item.child && item.child.length > 0) {
            traverse(item.child);
          }
        }
      };

      if (menuItems) {
        traverse(menuItems);
      }
      return ids;
    };

    const selectedMenuIds = getMenuIdsFromIdTitles(values.menuAccess || [], menuData?.data || []);

    const payload = {
      name: values.name,
      permission: values.explicitPermissions || [],
      guard_name: 'api',
    };

    try {
      if (initialData) {
        await updateRole({ id: initialData.id, data: payload }).unwrap();
        await assignRoleMenus({ role_id: initialData.id, menu_ids: selectedMenuIds }).unwrap();
        toast.showSuccess(`Peran "${values.name}" berhasil diperbarui.`);
      } else {
        const created = await createRole(payload).unwrap();
        await assignRoleMenus({ role_id: created.id, menu_ids: selectedMenuIds }).unwrap();
        toast.showSuccess(`Peran "${values.name}" berhasil ditambahkan.`);
      }
      onSuccess();
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
          } else if (typeof fetchError.status === 'string' && 'error' in fetchError) {
            errorMessage = fetchError.error;
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

      toast.showError(`Gagal menyimpan peran: ${errorMessage}`);
    }
  };

  const allPermissionNames = useMemo(() => {
    if (permissionsData && Array.isArray(permissionsData)) {
      const allPermissionNames = new Set(permissionsData.map(p => p.name));
      return Array.from(allPermissionNames).map(name => ({ value: name, label: name }));
    }
    return [];
  }, [permissionsData]);
  
  const permissionOptions: Option[] = useMemo(() => {
    if (permissionsData && Array.isArray(permissionsData)) {
      return permissionsData.map(p => ({ value: p.name, label: p.name }));
    }
    return [];
  }, [permissionsData]);

  const topLevelMenus = useMemo(() => {
    if (!menuData?.data) {
      return [];
    }
    return menuData.data.filter(menu => menu.parent_id === null);
  }, [menuData]);

  const isSubmitting = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Kolom Kiri: Detail Peran & Hak Akses */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Peran</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Guru" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Deskripsi singkat peran ini..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="explicitPermissions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hak Akses (Permissions)</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={permissionOptions}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder="Pilih hak akses..."
                      disabled={isLoadingPermissions}
                      className="h-auto min-h-24"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Kolom Kanan: Hak Akses Menu */}
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="menuAccess"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hak Akses Menu</FormLabel>
                  {isLoadingMenu ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : (
                    <MenuTreeView
                      menus={topLevelMenus}
                      selectedPermissions={field.value || []}
                      onSelectionChange={field.onChange}
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" variant="success" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Peran')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PeranForm;