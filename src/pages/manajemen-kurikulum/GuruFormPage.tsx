import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User } from 'lucide-react';

import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ActionButton from '@/components/ActionButton';
import * as toast from '@/utils/toast';
import { useAddTeacherMutation, useGetTeacherByIdQuery, useUpdateTeacherMutation } from '@/store/slices/teacherApi';

const formSchema = z.object({
  first_name: z.string().min(1, { message: 'Nama depan wajib diisi.' }),
  last_name: z.string().optional(),
  // education_level dan class_name dihapus sesuai permintaan
  status: z.enum(['active', 'inactive', 'on_leave'], {
    required_error: 'Status wajib dipilih.',
  }),
});

type GuruFormValues = z.infer<typeof formSchema>;

const GuruFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const { data: teacherData, isLoading: isLoadingTeacher } = useGetTeacherByIdQuery(id!, {
    skip: !isEditMode,
  });

  const [addTeacher, { isLoading: isAdding }] = useAddTeacherMutation();
  const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();

  const form = useForm<GuruFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      // education_level: '', // Dihapus
      // class_name: '', // Dihapus
      status: 'active',
    },
  });

  useEffect(() => {
    if (isEditMode && teacherData) {
      const teacher = teacherData.data;
      form.reset({
        first_name: teacher.first_name,
        last_name: teacher.last_name || '',
        // education_level: teacher.education_level, // Dihapus
        // class_name: teacher.class_name, // Dihapus
        status: teacher.status,
      });
    }
  }, [isEditMode, teacherData, form]);

  const onSubmit = async (values: GuruFormValues) => {
    try {
      if (isEditMode && id) {
        await updateTeacher({ id, data: values }).unwrap();
        toast.showSuccess('Data guru berhasil diperbarui!');
      } else {
        await addTeacher(values).unwrap();
        toast.showSuccess('Guru baru berhasil ditambahkan!');
      }
      navigate('/dashboard/manajemen-kurikulum/guru');
    } catch (error) {
      console.error('Gagal menyimpan data guru:', error);
      toast.showError('Gagal menyimpan data guru.');
    }
  };

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/administrasi' },
    { label: 'Manajemen Kurikulum', href: '/dashboard/manajemen-kurikulum/mata-pelajaran' },
    { label: 'Guru', href: '/dashboard/manajemen-kurikulum/guru' },
    { label: isEditMode ? 'Edit Guru' : 'Tambah Guru', icon: <User className="h-4 w-4" /> },
  ];

  const isLoading = isAdding || isUpdating;

  return (
    <DashboardLayout title={isEditMode ? 'Edit Guru' : 'Tambah Guru'} role="administrasi">
      <div className="container mx-auto px-4 pb-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? 'Edit Guru' : 'Tambah Guru'}</CardTitle>
            <CardDescription>
              {isEditMode ? 'Perbarui detail data guru.' : 'Isi formulir di bawah ini untuk menambahkan guru baru.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditMode && isLoadingTeacher ? (
              <p>Memuat data guru...</p>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Depan</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan nama depan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Belakang</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan nama belakang" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* FormField untuk education_level dan class_name dihapus */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Aktif</SelectItem>
                              <SelectItem value="inactive">Tidak Aktif</SelectItem>
                              <SelectItem value="on_leave">Cuti</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end space-x-4 mt-8">
                    <ActionButton
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/dashboard/manajemen-kurikulum/guru')}
                      disabled={isLoading}
                    >
                      Batal
                    </ActionButton>
                    <ActionButton type="submit" isLoading={isLoading}>
                      {isEditMode ? 'Simpan Perubahan' : 'Simpan'}
                    </ActionButton>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GuruFormPage;