import React, { useMemo, useEffect, useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as toast from '@/utils/toast';
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useSyncPermissionMatrixMutation,
  useGetPermissionMatrixQuery,
  type PermissionMatrixItem
} from '../../store/slices/roleApi';
import { useGetMenuQuery } from '@/store/slices/menuApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionMatrix } from '@/components/role/PermissionMatrix';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Nama Peran harus minimal 2 karakter.',
  }),
  category: z.string().optional(),
  description: z.string().optional(),
  permissionMatrix: z.array(z.object({
    menu_id: z.number(),
    permissions: z.array(z.string()),
    custom_permissions: z.array(z.string()).default([]),

  })),
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
  const [syncMatrix, { isLoading: isSyncing }] = useSyncPermissionMatrixMutation();

  const { data: menuData, isLoading: isLoadingMenu } = useGetMenuQuery();
  const { data: matrixData, isLoading: isLoadingMatrix } = useGetPermissionMatrixQuery(
    initialData?.id!,
    { skip: !initialData?.id }
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.roleName || '',
      category: '',
      description: initialData?.description || '',
      permissionMatrix: [],
    },
  });

  // Load permission matrix data when editing
  useEffect(() => {
    if (initialData && matrixData) {
      // Extract matrix array from various response shapes
      let matrixArray: any[] = [];
      if (Array.isArray(matrixData)) {
        matrixArray = matrixData;
      } else if (matrixData && typeof matrixData === 'object') {
        if ('matrix' in matrixData && Array.isArray(matrixData.matrix)) {
          matrixArray = matrixData.matrix;
        } else if ('data' in matrixData && Array.isArray((matrixData as any).data)) {
          matrixArray = (matrixData as any).data;
        }
      }

      const extractStrings = (arr: any[]): string[] => {
        if (!Array.isArray(arr)) return [];
        return arr.map((p: any) => {
          if (typeof p === 'string') return p;
          if (p && typeof p === 'object') return p.name || p.slug || p.permission || '';
          return String(p);
        }).filter((p: string) => !!p);
      };

      const matrix: PermissionMatrixItem[] = matrixArray.map((item) => ({
        menu_id: Number(item.menu_id || item.id),
        permissions: extractStrings(item.permissions || []),
        custom_permissions: extractStrings(item.custom_permissions || []),
      }));

      form.setValue('permissionMatrix', matrix);

      // Set category if available

      const category = matrixData.role?.category || (matrixData as any).category;
      if (category) {
        form.setValue('category', category);
      }
    }
  }, [initialData, matrixData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let roleId: number;

      if (initialData) {
        // Update existing role
        await updateRole({
          id: initialData.id,
          data: {
            name: values.name,
            guard_name: 'api',
            category: values.category || undefined,
          },
        }).unwrap();
        roleId = initialData.id;
      } else {
        // Create new role
        const created = await createRole({
          name: values.name,
          guard_name: 'api',
          category: values.category || undefined,
        }).unwrap();
        roleId = created.id;
      }

      // Sync permission matrix
      await syncMatrix({
        roleId,
        data: { matrix: values.permissionMatrix as unknown as PermissionMatrixItem[] },
      }).unwrap();



      toast.showSuccess(`Peran "${values.name}" berhasil ${initialData ? 'diperbarui' : 'ditambahkan'}.`);
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

  const isSubmitting = isCreating || isUpdating || isSyncing;
  const isLoading = isLoadingMenu || isLoadingMatrix;

  if (isLoading && initialData) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Role</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: admin, asatidz, walikelas" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori (opsional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pendidikan">Pendidikan</SelectItem>
                    <SelectItem value="administrasi">Administrasi</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        {/* Permission Matrix Section */}
        <FormField
          control={form.control}
          name="permissionMatrix"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Permission Matrix</FormLabel>
              <FormControl>
                {menuData?.data ? (
                  <PermissionMatrix
                    menus={menuData.data}
                    value={field.value}
                    onChange={field.onChange}
                  />
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Tidak ada menu tersedia
                  </div>
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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