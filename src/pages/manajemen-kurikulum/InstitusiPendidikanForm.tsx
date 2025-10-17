import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as toast from '@/utils/toast';
import { useGetEducationLevelsQuery } from '@/store/slices/educationApi';
import { useCreateInstitusiPendidikanMutation, useUpdateInstitusiPendidikanMutation } from '@/store/slices/institusiPendidikanApi';
import { InstitusiPendidikan } from '@/types/pendidikan';
import { useGetEducationGroupsQuery } from '@/store/slices/educationGroupApi';
import { useGetStaffsQuery } from '@/store/slices/teacherApi';
import { CreateUpdateInstitusiPendidikanRequest } from '@/store/slices/institusiPendidikanApi';
import { Staff } from '@/types/teacher';

const formSchema = z.object({
  institution_name: z.string().min(1, { message: 'Nama institusi harus diisi.' }),
  education_id: z.preprocess((val) => Number(val), z.number().min(1, { message: 'Jenjang pendidikan harus dipilih.' })),
  education_class_id: z.preprocess((val) => Number(val), z.number().min(1, { message: 'Kelompok pendidikan harus dipilih.' })),
  headmaster_id: z.string().min(1, { message: 'Kepala sekolah harus dipilih.' }),
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
  const { data: educationLevelsData } = useGetEducationLevelsQuery({});
  const { data: educationGroupsData } = useGetEducationGroupsQuery();
  const { data: usersData } = useGetStaffsQuery();
  const [createInstitusi, { isLoading: isCreating }] = useCreateInstitusiPendidikanMutation();
  const [updateInstitusi, { isLoading: isUpdating }] = useUpdateInstitusiPendidikanMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      education_id: initialData.education_id || 0,
      education_class_id: initialData.education_class?.id || 0,
      headmaster_id: initialData.headmaster_id || '',
    } : {
      institution_name: '',
      education_id: 0,
      education_class_id: 0,
      headmaster_id: '',
      registration_number: '',
      institution_status: 'active',
      institution_address: '',
      institution_description: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const requestData: CreateUpdateInstitusiPendidikanRequest = {
        institution_name: values.institution_name,
        education_id: values.education_id,
        education_class_id: values.education_class_id,
        headmaster_id: values.headmaster_id,
        registration_number: values.registration_number,
        institution_status: values.institution_status,
        institution_address: values.institution_address,
        institution_description: values.institution_description,
      };

      if (initialData) {
        await updateInstitusi({ id: initialData.id, data: requestData }).unwrap();
        toast.showSuccess('Data berhasil diperbarui.');
      } else {
        await createInstitusi(requestData).unwrap();
        toast.showSuccess('Data berhasil ditambahkan.');
      }
      onSuccess();
    } catch (error) {
      toast.showError('Gagal menyimpan data.');
    }
  };

  const isLoading = isCreating || isUpdating;
  const educationLevels = educationLevelsData?.data || [];
  const educationGroups = educationGroupsData?.data || [];
  
  // Ekstrak data staf dari usersData yang memiliki properti staff
  const staffs = useMemo(() => {
    if (!usersData) return [];
    return usersData
      .filter((user: any) => user.staff)
      .map((user: any) => user.staff) as Staff[];
  }, [usersData]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="institution_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Institusi</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nama institusi" {...field} />
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
                <FormLabel>Jenjang Pendidikan</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenjang pendidikan" />
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
            name="education_class_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kelompok Pendidikan</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kelompok pendidikan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {educationGroups.map((group) => (
                      <SelectItem key={group.id} value={String(group.id)}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="registration_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Registrasi</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nomor registrasi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="headmaster_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kepala Sekolah</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kepala sekolah" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {staffs.map((staff: Staff) => (
                      <SelectItem key={staff.id} value={String(staff.id)}>
                        {staff.first_name} {staff.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <FormLabel>Alamat Institusi</FormLabel>
              <FormControl>
                <Textarea placeholder="Masukkan alamat institusi" {...field} />
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
              <FormLabel>Deskripsi Institusi</FormLabel>
              <FormControl>
                <Textarea placeholder="Masukkan deskripsi institusi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" variant="success" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InstitusiPendidikanForm;