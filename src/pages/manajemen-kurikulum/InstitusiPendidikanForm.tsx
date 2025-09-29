import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as toast from '@/utils/toast';
import { useGetEducationLevelsQuery } from '@/store/slices/educationApi';
import { useCreateInstitusiPendidikanMutation, useUpdateInstitusiPendidikanMutation } from '@/store/slices/institusiPendidikanApi';
import { InstitusiPendidikan } from '@/types/pendidikan';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Nama institusi harus diisi.' }),
  education_level_id: z.preprocess((val) => Number(val), z.number().min(1, { message: 'Jenjang pendidikan harus dipilih.' })),
  category: z.string().min(1, { message: 'Kategori pendidikan harus diisi.' }),
  number_of_classes: z.preprocess((val) => Number(val), z.number().min(1, { message: 'Jumlah kelas harus diisi.' })),
});

interface InstitusiPendidikanFormProps {
  initialData?: InstitusiPendidikan;
  onSuccess: () => void;
  onCancel: () => void;
}

const InstitusiPendidikanForm: React.FC<InstitusiPendidikanFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { data: educationLevelsData } = useGetEducationLevelsQuery();
  const [createInstitusi, { isLoading: isCreating }] = useCreateInstitusiPendidikanMutation();
  const [updateInstitusi, { isLoading: isUpdating }] = useUpdateInstitusiPendidikanMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      education_level_id: 0,
      category: '',
      number_of_classes: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (initialData) {
        await updateInstitusi({ id: initialData.id, data: values }).unwrap();
        toast.showSuccess(t('institusiPendidikanForm.successEdit'));
      } else {
        await createInstitusi(values).unwrap();
        toast.showSuccess(t('institusiPendidikanForm.successAdd'));
      }
      onSuccess();
    } catch (error) {
      toast.showError('Gagal menyimpan data.');
    }
  };

  const isLoading = isCreating || isUpdating;
  const educationLevels = educationLevelsData?.data || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('institusiPendidikanForm.nameLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('institusiPendidikanForm.namePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="education_level_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('institusiPendidikanForm.educationLevelLabel')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('institusiPendidikanForm.selectEducationLevel')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {educationLevels.map((level) => (
                    <SelectItem key={level.id} value={String(level.id)}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('institusiPendidikanForm.categoryLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('institusiPendidikanForm.categoryPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="number_of_classes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('institusiPendidikanForm.classCountLabel')}</FormLabel>
              <FormControl>
                <Input type="number" placeholder={t('institusiPendidikanForm.classCountPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            {t('cancelButton')}
          </Button>
          <Button type="submit" variant="success" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : t('lessonHoursForm.saveButton')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InstitusiPendidikanForm;