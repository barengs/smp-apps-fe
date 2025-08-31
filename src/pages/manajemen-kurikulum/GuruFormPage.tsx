import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User } from 'lucide-react';
import { format } from 'date-fns';

import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import ActionButton from '@/components/ActionButton';
import * as toast from '@/utils/toast';
import FormStepIndicator from '@/components/FormStepIndicator'; // Import komponen baru

import { useGetProvincesQuery } from '@/store/slices/provinceApi';
import { useGetCitiesQuery } from '@/store/slices/cityApi';
import { useGetDistrictsQuery } from '@/store/slices/districtApi';
import { useLazyGetVillagesQuery } from '@/store/slices/villageApi';
import { useGetPekerjaanQuery } from '@/store/slices/pekerjaanApi';
import { useGetRolesQuery } from '@/store/slices/roleApi';
import { useAddTeacherMutation, useGetTeacherByIdQuery, useUpdateTeacherMutation } from '@/store/slices/teacherApi';

import GuruProfileStep from './form-steps/GuruProfileStep';
import GuruAddressStep from './form-steps/GuruAddressStep';
import GuruEmploymentStep from './form-steps/GuruEmploymentStep';

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
  password: z.string().min(8, 'Password minimal 8 karakter').optional().or(z.literal('')),
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

  const [currentStep, setCurrentStep] = useState(0);
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
      first_name: '',
      last_name: '',
      nik: '',
      nip: '',
      phone_number: '',
      email: '',
      birth_place: '',
      address: '',
      province_code: '',
      city_code: '',
      district_code: '',
      village_code: '',
      religion: '',
      marital_status: '',
      password: '',
      password_confirmation: '',
    },
    mode: 'onChange',
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
      triggerGetVillages({ page: 1, per_page: 1000 });
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
        last_name: teacher.last_name || '',
        nik: teacher.nik || '',
        nip: teacher.nip || '',
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
      if (value !== null && value !== undefined && value !== '') {
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

  const stepFields: (keyof GuruFormValues)[][] = [
    ['first_name', 'gender', 'phone_number', 'email', 'birth_place', 'birth_date'],
    ['address', 'province_code', 'city_code', 'district_code', 'village_code'],
    ['religion', 'marital_status', 'job_id', 'role_id', 'status', 'password', 'password_confirmation'],
  ];

  const steps = [
    { name: 'Profil Guru', component: <GuruProfileStep form={form} photoPreview={photoPreview} setPhotoPreview={setPhotoPreview} /> },
    { name: 'Alamat', component: <GuruAddressStep form={form} provinces={provinces.map(p => ({ value: p.code, label: p.name }))} cities={filteredCities.map(c => ({ value: c.code, label: c.name }))} districts={filteredDistricts.map(d => ({ value: d.code, label: d.name }))} villages={filteredVillages.map(v => ({ value: v.code, label: v.name }))} isCityDisabled={!provinceCode} isDistrictDisabled={!cityCode} isVillageDisabled={!districtCode} /> },
    { name: 'Kepegawaian & Akun', component: <GuruEmploymentStep form={form} jobs={jobs.map(j => ({ value: j.id, label: j.name }))} roles={roles.data.map(r => ({ value: r.id, label: r.name }))} isEditMode={isEditMode} showPassword={showPassword} setShowPassword={setShowPassword} showConfirmPassword={showConfirmPassword} setShowConfirmPassword={setShowConfirmPassword} /> },
  ];

  const handleNext = async () => {
    const isValid = await form.trigger(stepFields[currentStep]);
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast.showError("Harap lengkapi semua bidang wajib di langkah ini.");
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  return (
    <DashboardLayout title={isEditMode ? 'Edit Guru' : 'Tambah Guru'} role="administrasi">
      <div className="container mx-auto px-4 pb-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <FormStepIndicator steps={steps.map(s => s.name)} currentStep={currentStep} />
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{isEditMode ? 'Edit Guru' : 'Tambah Guru'}</CardTitle>
            <CardDescription>Langkah {currentStep + 1} dari {steps.length}: {steps[currentStep].name}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && isEditMode ? <p>Memuat data...</p> : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {steps[currentStep].component}
                  <div className="flex justify-between pt-4">
                    <div className="flex gap-2">
                      {currentStep > 0 && (
                        <ActionButton type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
                          Kembali
                        </ActionButton>
                      )}
                      <ActionButton type="button" variant="outline-danger" onClick={() => navigate('/dashboard/manajemen-kurikulum/guru')} disabled={isLoading}>
                        Batal
                      </ActionButton>
                    </div>
                    <div>
                      {currentStep < steps.length - 1 ? (
                        <ActionButton type="button" onClick={handleNext} disabled={isLoading}>
                          Selanjutnya
                        </ActionButton>
                      ) : (
                        <ActionButton type="submit" isLoading={isLoading}>
                          {isEditMode ? 'Simpan Perubahan' : 'Simpan'}
                        </ActionButton>
                      )}
                    </div>
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