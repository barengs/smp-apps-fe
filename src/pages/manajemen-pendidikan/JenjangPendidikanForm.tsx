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
  education_class_codes: z.array(z.string()).optional(),
});

interface JenjangPendidikanFormProps {
  initialData?: {
    id: number;
    name: string;
    description: string;
    education_class: { code: string; name: string }[];
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
      education_class_codes: initialData?.education_class?.map(ec => ec.code) || [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload: CreateUpdateEducationLevelRequest = {
      name: values.name,
      description: values.description,
      education_class_ids: (values.education_class_codes || []).map((code) => Number(code)),
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
    return educationGroupsData?.data.map(group => ({
      value: group.code,
      label: group.name,
    })) || [];
  }, [educationGroupsData]);

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
          name="education_class_codes"
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