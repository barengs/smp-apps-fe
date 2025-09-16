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

const formSchema = z.object({
  lesson_hour: z.coerce.number().min(0, { message: "Jam ke harus angka positif atau 0 untuk istirahat." }),
  start_time: z.string().min(1, { message: "Waktu mulai tidak boleh kosong." }).regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Format waktu mulai tidak valid (HH:MM)." }),
  end_time: z.string().min(1, { message: "Waktu selesai tidak boleh kosong." }).regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Format waktu selesai tidak valid (HH:MM)." }),
  description: z.string().optional(),
});

interface JamPelajaranFormProps {
  initialData?: JamPelajaran;
  onSuccess: () => void;
  onCancel: () => void;
}

const JamPelajaranForm: React.FC<JamPelajaranFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lesson_hour: initialData?.lesson_hour || 0,
      start_time: initialData?.start_time || '',
      end_time: initialData?.end_time || '',
      description: initialData?.description || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        lesson_hour: initialData.lesson_hour,
        start_time: initialData.start_time,
        end_time: initialData.end_time,
        description: initialData.description,
      });
    } else {
      form.reset({
        lesson_hour: 0,
        start_time: '',
        end_time: '',
        description: '',
      });
    }
  }, [initialData, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // TODO: Implement actual API call for adding/editing
    console.log('Form submitted:', values);
    if (initialData) {
      toast.showSuccess(t('lessonHoursForm.successEdit'));
    } else {
      toast.showSuccess(t('lessonHoursForm.successAdd'));
    }
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="lesson_hour"
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
          name="description"
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
          <Button type="submit">
            {t('lessonHoursForm.saveButton')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default JamPelajaranForm;