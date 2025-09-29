import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as toast from '@/utils/toast';
import { useGetEducationLevelsQuery } from '@/store/slices/educationApi';
import { useCreateInstitusiPendidikanMutation, useUpdateInstitusiPendidikanMutation } from '@/store/slices/institusiPendidikanApi';
import { InstitusiPendidikan } from '@/types/pendidikan';

const formSchema = z.object({
  institution_name: z.string().min(1, { message: 'Nama institusi harus diisi.' }),
  education_id: z.preprocess((val) => Number(val), z.number().min(1, { message: 'Jenjang pendidikan harus dipilih.' })),
  registration_number: z.string().min(1, { message: 'Nomor registrasi harus diisi.' }),
  institution_status: z.string().min(1, { message: 'Status harus dipilih.' }),
  institution_address: z.string().optional(),
  institution_description: z.string().optional(),
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
    defaultValues: initialData ? {
      ...initialData,
      education_id: initialData.education_id || 0,
    } : {
      institution_name: '',
      education_id: 0,
      registration_number: '',
      institution_status: 'active',
      institution_address: '',
      institution_description: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload = {
      institution_name: values.institution_name,
      education_id: values.education_id,
      registration_number: values.registration_number,
      institution_status: values.institution_status,
      institution_address: values.institution_address,
      institution_description: values.institution_description,
    };

    try {
      if (initialData) {
        await updateInstitusi({ id: initialData.id, data: payload }).unwrap();
        toast.showSuccess(t('institusiPendidikanForm.successEdit'));
      } else {
        await createInstitusi(payload).unwrap();
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
          name="institution_name"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="education_id"
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
            name="registration_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('institusiPendidikanForm.registrationNumberLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('institusiPendidikanForm.registrationNumberPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="institution_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('institusiPendidikanForm.statusLabel')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('institusiPendidikanForm.selectStatus')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="institution_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('institusiPendidikanForm.addressLabel')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('institusiPendidikanForm.addressPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="institution_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('institusiPendidikanForm.descriptionLabel')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('institusiPendidikanForm.descriptionPlaceholder')} {...field} />
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