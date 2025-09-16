import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { JamPelajaran } from '@/types/kurikulum';
import * as toast from '@/utils/toast';
import TimePicker from '@/components/TimePicker'; // Import TimePicker
import { useAddLessonHourMutation, useUpdateLessonHourMutation } from '@/store/slices/lessonHourApi';

const formSchema = z.object({
  order: z.coerce.number().min(0, { message: "Jam ke harus angka positif atau 0 untuk istirahat." }),
  start_time: z.string().min(1, { message: "Waktu mulai tidak boleh kosong." }).regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Format waktu mulai tidak valid (HH:MM)." }),
  end_time: z.string().min(1, { message: "Waktu selesai tidak boleh kosong." }).regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Format waktu selesai tidak valid (HH:MM)." }),
  name: z.string().optional(),
});

interface JamPelajaranFormProps {
  initialData?: JamPelajaran;
  onSuccess: () => void;
  onCancel: () => void;
}

const JamPelajaranForm: React.FC<JamPelajaranFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const [addLessonHour, { isLoading: isAdding }] = useAddLessonHourMutation();
  const [updateLessonHour, { isLoading: isUpdating }] = useUpdateLessonHourMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      order: initialData?.order ?? 0,
      start_time: initialData?.start_time || '',
      end_time: initialData?.end_time || '',
      name: initialData?.name || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        order: initialData.order,
        start_time: initialData.start_time,
        end_time: initialData.end_time,
        name: initialData.name,
      });
    } else {
      form.reset({
        order: 0,
        start_time: '',
        end_time: '',
        name: '',
      });
    }
  }, [initialData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (initialData) {
        const updatePayload = {
          id: initialData.id,
          order: values.order,
          start_time: values.start_time,
          end_time: values.end_time,
          name: values.name,
        };
        await updateLessonHour(updatePayload).unwrap();
        toast.showSuccess(t('lessonHoursForm.successEdit'));
      } else {
        const addPayload = {
          order: values.order,
          start_time: values.start_time,
          end_time: values.end_time,
          name: values.name,
        };
        await addLessonHour(addPayload).unwrap();
        toast.showSuccess(t('lessonHoursForm.successAdd'));
      }
      onSuccess();
    } catch (error) {
      toast.showError('Gagal menyimpan data. Silakan coba lagi.');
      console.error('Failed to save lesson hour:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('lessonHoursForm.lessonHourLabel')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t('lessonHoursForm.lessonHourPlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('lessonHoursForm.startTimeLabel')}</FormLabel>
                <FormControl>
                  <TimePicker
                    placeholder={t('lessonHoursForm.startTimePlaceholder')}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={field.disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('lessonHoursForm.endTimeLabel')}</FormLabel>
                <FormControl>
                  <TimePicker
                    placeholder={t('lessonHoursForm.endTimePlaceholder')}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={field.disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('lessonHoursForm.descriptionLabel')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('lessonHoursForm.descriptionPlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('lessonHoursForm.cancelButton')}
          </Button>
          <Button type="submit" disabled={isAdding || isUpdating}>
            {isAdding || isUpdating ? 'Menyimpan...' : t('lessonHoursForm.saveButton')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default JamPelajaranForm;