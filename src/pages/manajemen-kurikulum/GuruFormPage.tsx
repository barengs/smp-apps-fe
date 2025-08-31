import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';

import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/datepicker';
import { Combobox } from '@/components/ui/combobox';
import ProfilePhotoCard from '@/components/ProfilePhotoCard';
import ActionButton from '@/components/ActionButton';
import * as toast from '@/utils/toast';

import { useGetProvincesQuery } from '@/store/slices/provinceApi';
import { useGetCitiesQuery } from '@/store/slices/cityApi';
import { useGetDistrictsQuery } from '@/store/slices/districtApi';
import { useLazyGetVillagesQuery } from '@/store/slices/villageApi';
import { useGetPekerjaanQuery } from '@/store/slices/pekerjaanApi';
import { useGetRolesQuery } from '@/store/slices/roleApi';
import { useAddTeacherMutation, useGetTeacherByIdQuery, useUpdateTeacherMutation } from '@/store/slices/teacherApi';

const formSchema = z.object({
  first_name: z.string().min(1, 'Nama depan wajib diisi'),
  last_name: z.string().optional(),
  nik: z.string().length(16, 'NIK harus 16 digit').optional().or(z.literal('')),
  nip: z.string().optional(),
  gender: z.enum(['male', 'female'], { required_error: 'Jenis kelamin wajib dipilih' }),
  phone_number: z.string().min(10, 'Nomor telepon minimal 10 digit'),
  email: z.string().email('Email tidak valid'),
  birth_place: z.string().min(1, 'Tempat lahir wajib diisi'),
  birth_date: z.date({ required_error: 'Tanggal lahir wajib diisi' }),
  address: z.string().min(1, 'Alamat wajib diisi'),
  province_code: z.string().min(1, 'Provinsi wajib dipilih'),
  city_code: z.string().min(1, 'Kota/Kabupaten wajib dipilih'),
  district_code: z.string().min(1, 'Kecamatan wajib dipilih'),
  village_code: z.string().min(1, 'Desa/Kelurahan wajib dipilih'),
  religion: z.string().min(1, 'Agama wajib dipilih'),
  marital_status: z.string().min(1, 'Status pernikahan wajib dipilih'),
  job_id: z.number({ required_error: 'Pekerjaan wajib dipilih' }),
  role_id: z.number({ required_error: 'Hak akses wajib dipilih' }),
  status: z.enum(['active', 'inactive', 'on_leave']),
  photo: z.any().optional(),
  password: z.string().min(8, 'Password minimal 8 karakter').optional(),
  password_confirmation: z.string().optional(),
}).refine(data => {
  if (data.password && data.password !== data.password_confirmation) {
    return false;
  }
  return true;
}, {
  message: 'Konfirmasi password tidak cocok',
  path: ['password_confirmation'],
});

type GuruFormValues = z.infer<typeof formSchema>;

const GuruFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: teacherData, isLoading: isLoadingTeacher } = useGetTeacherByIdQuery(id!, { skip: !isEditMode });
  const [addTeacher, { isLoading: isAdding }] = useAddTeacherMutation();
  const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();

  const form = useForm<GuruFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'active',
      gender: 'male',
    },
  });

  const { data: provinces = [] } = useGetProvincesQuery();
  const { data: cities = [] } = useGetCitiesQuery();
  const { data: districts = [] } = useGetDistrictsQuery();
  const [triggerGetVillages, { data: villages = { data: [] } }] = useLazyGetVillagesQuery();
  const { data: jobs = [] } = useGetPekerjaanQuery();
  const { data: roles = { data: [] } } = useGetRolesQuery();

  const provinceCode = form.watch('province_code');
  const cityCode = form.watch('city_code');
  const districtCode = form.watch('district_code');

  useEffect(() => {
    if (districtCode) {
      triggerGetVillages({ page: 1, per_page: 1000 }); // Fetch all villages for now
    }
  }, [districtCode, triggerGetVillages]);

  useEffect(() => {
    if (isEditMode && teacherData) {
      const teacher = teacherData.data;
      const village = teacher.village;
      const district = village?.district;
      const city = district?.city;
      const province = city?.province;

      form.reset({
        first_name: teacher.first_name,
        last_name: teacher.last_name,
        nik: teacher.nik,
        nip: teacher.nip,
        gender: teacher.gender,
        phone_number: teacher.phone_number,
        email: teacher.email,
        birth_place: teacher.birth_place,
        birth_date: new Date(teacher.birth_date),
        address: teacher.address,
        province_code: province?.code,
        city_code: city?.code,
        district_code: district?.code,
        village_code: village?.code,
        religion: teacher.religion,
        marital_status: teacher.marital_status,
        job_id: teacher.job_id,
        role_id: teacher.user?.roles[0]?.id,
        status: teacher.status,
      });
      if (teacher.photo) {
        setPhotoPreview(teacher.photo);
      }
    }
  }, [isEditMode, teacherData, form, triggerGetVillages]);

  const onSubmit = async (values: GuruFormValues) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'birth_date' && value instanceof Date) {
          formData.append(key, format(value, 'yyyy-MM-dd'));
        } else if (key === 'photo' && value instanceof File) {
          formData.append(key, value);
        } else if (key !== 'photo') {
          formData.append(key, String(value));
        }
      }
    });

    try {
      if (isEditMode && id) {
        await updateTeacher({ id, data: formData }).unwrap();
        toast.showSuccess('Data guru berhasil diperbarui!');
      } else {
        await addTeacher(formData).unwrap();
        toast.showSuccess('Guru baru berhasil ditambahkan!');
      }
      navigate('/dashboard/manajemen-kurikulum/guru');
    } catch (error) {
      toast.showError('Gagal menyimpan data guru.');
      console.error(error);
    }
  };

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/administrasi' },
    { label: 'Manajemen Kurikulum' },
    { label: 'Guru', href: '/dashboard/manajemen-kurikulum/guru' },
    { label: isEditMode ? 'Edit Guru' : 'Tambah Guru', icon: <User className="h-4 w-4" /> },
  ];

  const isLoading = isAdding || isUpdating || isLoadingTeacher;

  const filteredCities = useMemo(() => cities.filter(c => c.province_code === provinceCode), [cities, provinceCode]);
  const filteredDistricts = useMemo(() => districts.filter(d => d.city_code === cityCode), [districts, cityCode]);
  const filteredVillages = useMemo(() => villages.data.filter(v => v.district_code === districtCode), [villages.data, districtCode]);

  return (
    <DashboardLayout title={isEditMode ? 'Edit Guru' : 'Tambah Guru'} role="administrasi">
      <div className="container mx-auto px-4 pb-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? 'Edit Guru' : 'Tambah Guru'}</CardTitle>
            <CardDescription>Lengkapi formulir di bawah ini untuk {isEditMode ? 'memperbarui' : 'menambahkan'} data guru.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && isEditMode ? <p>Memuat data...</p> : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1 flex flex-col items-center">
                      <FormField
                        control={form.control}
                        name="photo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-center block mb-2">Foto Profil</FormLabel>
                            <FormControl>
                              <>
                                <ProfilePhotoCard photoUrl={photoPreview} />
                                <Input
                                  type="file"
                                  className="mt-2"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      field.onChange(file);
                                      setPhotoPreview(URL.createObjectURL(file));
                                    }
                                  }}
                                />
                              </>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField name="first_name" control={form.control} render={({ field }) => (<FormItem><FormLabel>Nama Depan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField name="last_name" control={form.control} render={({ field }) => (<FormItem><FormLabel>Nama Belakang</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField name="nik" control={form.control} render={({ field }) => (<FormItem><FormLabel>NIK</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField name="nip" control={form.control} render={({ field }) => (<FormItem><FormLabel>NIP</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField name="gender" control={form.control} render={({ field }) => (<FormItem><FormLabel>Jenis Kelamin</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Laki-laki</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Perempuan</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
                      <FormField name="phone_number" control={form.control} render={({ field }) => (<FormItem><FormLabel>Nomor Telepon</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField name="email" control={form.control} render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField name="birth_place" control={form.control} render={({ field }) => (<FormItem><FormLabel>Tempat Lahir</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <Controller name="birth_date" control={form.control} render={({ field }) => (<FormItem><FormLabel>Tanggal Lahir</FormLabel><FormControl><DatePicker value={field.value} onValueChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField name="religion" control={form.control} render={({ field }) => (<FormItem><FormLabel>Agama</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Agama" /></SelectTrigger></FormControl><SelectContent><SelectItem value="islam">Islam</SelectItem><SelectItem value="kristen">Kristen</SelectItem><SelectItem value="katolik">Katolik</SelectItem><SelectItem value="hindu">Hindu</SelectItem><SelectItem value="buddha">Buddha</SelectItem><SelectItem value="konghucu">Konghucu</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                      <FormField name="marital_status" control={form.control} render={({ field }) => (<FormItem><FormLabel>Status Pernikahan</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="single">Belum Menikah</SelectItem><SelectItem value="married">Menikah</SelectItem><SelectItem value="divorced">Bercerai</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                      <Controller name="job_id" control={form.control} render={({ field }) => (<FormItem><FormLabel>Pekerjaan</FormLabel><Combobox options={jobs.map(j => ({ value: j.id, label: j.name }))} value={field.value} onChange={field.onChange} placeholder="Pilih Pekerjaan" /><FormMessage /></FormItem>)} />
                      <Controller name="role_id" control={form.control} render={({ field }) => (<FormItem><FormLabel>Hak Akses</FormLabel><Combobox options={roles.data.map(r => ({ value: r.id, label: r.name }))} value={field.value} onChange={field.onChange} placeholder="Pilih Hak Akses" /><FormMessage /></FormItem>)} />
                      <FormField name="status" control={form.control} render={({ field }) => (<FormItem><FormLabel>Status Kepegawaian</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="active">Aktif</SelectItem><SelectItem value="inactive">Tidak Aktif</SelectItem><SelectItem value="on_leave">Cuti</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <CardTitle className="text-lg">Informasi Alamat</CardTitle>
                    <FormField name="address" control={form.control} render={({ field }) => (<FormItem><FormLabel>Alamat Lengkap</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <Controller name="province_code" control={form.control} render={({ field }) => (<FormItem><FormLabel>Provinsi</FormLabel><Combobox options={provinces.map(p => ({ value: p.code, label: p.name }))} value={field.value} onChange={field.onChange} placeholder="Pilih Provinsi" /><FormMessage /></FormItem>)} />
                      <Controller name="city_code" control={form.control} render={({ field }) => (<FormItem><FormLabel>Kota/Kabupaten</FormLabel><Combobox options={filteredCities.map(c => ({ value: c.code, label: c.name }))} value={field.value} onChange={field.onChange} placeholder="Pilih Kota/Kabupaten" disabled={!provinceCode} /><FormMessage /></FormItem>)} />
                      <Controller name="district_code" control={form.control} render={({ field }) => (<FormItem><FormLabel>Kecamatan</FormLabel><Combobox options={filteredDistricts.map(d => ({ value: d.code, label: d.name }))} value={field.value} onChange={field.onChange} placeholder="Pilih Kecamatan" disabled={!cityCode} /><FormMessage /></FormItem>)} />
                      <Controller name="village_code" control={form.control} render={({ field }) => (<FormItem><FormLabel>Desa/Kelurahan</FormLabel><Combobox options={filteredVillages.map(v => ({ value: v.code, label: v.name }))} value={field.value} onChange={field.onChange} placeholder="Pilih Desa/Kelurahan" disabled={!districtCode} /><FormMessage /></FormItem>)} />
                    </div>
                  </div>

                  {!isEditMode && (
                    <div className="space-y-6">
                      <CardTitle className="text-lg">Informasi Akun</CardTitle>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField name="password" control={form.control} render={({ field }) => (<FormItem><FormLabel>Password</FormLabel><FormControl><div className="relative"><Input type={showPassword ? 'text' : 'password'} {...field} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">{showPassword ? <EyeOff /> : <Eye />}</button></div></FormControl><FormMessage /></FormItem>)} />
                        <FormField name="password_confirmation" control={form.control} render={({ field }) => (<FormItem><FormLabel>Konfirmasi Password</FormLabel><FormControl><div className="relative"><Input type={showConfirmPassword ? 'text' : 'password'} {...field} /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">{showConfirmPassword ? <EyeOff /> : <Eye />}</button></div></FormControl><FormMessage /></FormItem>)} />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-4">
                    <ActionButton type="button" variant="outline" onClick={() => navigate('/dashboard/manajemen-kurikulum/guru')} disabled={isLoading}>Batal</ActionButton>
                    <ActionButton type="submit" isLoading={isLoading}>{isEditMode ? 'Simpan Perubahan' : 'Simpan'}</ActionButton>
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