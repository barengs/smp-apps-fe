import React from 'react';
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
import { showSuccess, showError } from '@/utils/toast';
import { useCreateEducationLevelMutation, useUpdateEducationLevelMutation, type CreateUpdateEducationLevelRequest } from '@/store/slices/educationApi';
import { useGetEducationGroupsQuery } from '@/store/slices/educationGroupApi';
import MultiSelect, { type Option } from '@/components/MultiSelect';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Nama Jenjang Pendidikan harus minimal 2 karakter.',
  }),
  description: z.string().optional(),
  // Simpan ID sebagai string di form, nanti dikonversi ke number saat submit
  education_class_ids: z.array(z.string()).optional(),
});

interface JenjangPendidikanFormProps {
  initialData?: {
    id: number;
    name: string;
    description: string;
    // Idealnya API sudah mengembalikan id; jika tidak, code akan dipakai untuk fallback
    education_class: { id?: number; code?: string; name: string }[];
    level?: number;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const JenjangPendidikanForm: React.FC<JenjangPendidikanFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createEducationLevel, { isLoading: isCreating }] = useCreateEducationLevelMutation();
  const [updateEducationLevel, { isLoading: isUpdating }] = useUpdateEducationLevelMutation();
  const { data: educationGroupsData, isLoading: isLoadingGroups } = useGetEducationGroupsQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      // Default gunakan id jika tersedia; fallback mapping code -> id ditangani di useEffect di bawah
      education_class_ids:
        initialData?.education_class
          ?.map(ec => (ec.id != null ? String(ec.id) : undefined))
          .filter(Boolean) as string[] || [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload: CreateUpdateEducationLevelRequest = {
      name: values.name,
      description: values.description,
      // Konversi string id -> number id untuk API
      education_class_ids: (values.education_class_ids || []).map((id) => Number(id)),
      level: Number((initialData as any)?.level ?? 0),
    };

    try {
      if (initialData) {
        await updateEducationLevel({ id: initialData.id, data: payload }).unwrap();
        showSuccess(`Jenjang Pendidikan "${values.name}" berhasil diperbarui.`);
      } else {
        await createEducationLevel(payload).unwrap();
        showSuccess(`Jenjang Pendidikan "${values.name}" berhasil ditambahkan.`);
      }
      onSuccess();
    } catch (err: unknown) {
      let errorMessage = 'Terjadi kesalahan tidak dikenal.';
      if (typeof err === 'object' && err !== null) {
        if ('status' in err) {
          const fetchError = err as FetchBaseQueryError;
          if (fetchError.data && typeof fetchError.data === 'object' && 'message' in fetchError.data) {
            errorMessage = (fetchError.data as { message: string }).message;
          } else {
            errorMessage = `Error: Gagal memproses permintaan.`;
          }
        } else if ('message' in err) {
          errorMessage = (err as SerializedError).message ?? 'Error tidak diketahui';
        }
      }
      showError(`Gagal menyimpan jenjang pendidikan: ${errorMessage}`);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  const educationGroupOptions: Option[] = React.useMemo(() => {
    return educationGroupsData?.map(group => ({
      value: String(group.id), // gunakan ID sebagai value
      label: group.name,
    })) || [];
  }, [educationGroupsData]);

  // Fallback: jika initialData hanya memiliki code, map code -> id saat data groups sudah tersedia
  React.useEffect(() => {
    if (!initialData?.education_class || !educationGroupsData) return;
    const current = form.getValues('education_class_ids') || [];
    // Jika sudah ada id di form, tidak perlu override
    const hasIds = current.length > 0;
    if (hasIds) return;
    // Coba mapping code -> id
    const mappedIds = initialData.education_class
      .map(ec => {
        if (ec.id != null) return String(ec.id);
        if (ec.code) {
          const found = educationGroupsData.find(g => g.code === ec.code);
          return found ? String(found.id) : undefined;
        }
        return undefined;
      })
      .filter(Boolean) as string[];
    if (mappedIds.length > 0) {
      form.setValue('education_class_ids', mappedIds, { shouldValidate: true });
    }
  }, [initialData, educationGroupsData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Jenjang Pendidikan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Sekolah Menengah Pertama" {...field} />
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
                <Textarea placeholder="Deskripsi singkat jenjang pendidikan ini..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="education_class_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kelompok Pendidikan</FormLabel>
              <FormControl>
                <MultiSelect
                  options={educationGroupOptions}
                  selected={field.value || []}
                  onChange={field.onChange}
                  placeholder="Pilih kelompok pendidikan..."
                  disabled={isSubmitting || isLoadingGroups}
                />
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
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Jenjang')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default JenjangPendidikanForm;