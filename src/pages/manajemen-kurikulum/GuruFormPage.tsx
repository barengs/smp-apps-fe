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
import FormStepIndicator from '@/components/FormStepIndicator';

import { useGetProvincesQuery } from '@/store/slices/provinceApi';
import { useGetCitiesQuery } from '@/store/slices/cityApi';
import { useGetDistrictsQuery } from '@/store/slices/districtApi';
import { useLazyGetVillageByNikQuery } from '@/store/slices/villageApi';
import { useGetPekerjaanQuery } from '@/store/slices/pekerjaanApi';
import { useGetRolesQuery } from '@/store/slices/roleApi';
import { useAddTeacherMutation, useGetTeacherByIdQuery, useUpdateTeacherMutation } from '@/store/slices/teacherApi';
import { useLazyCheckNikQuery } from '@/store/slices/employeeApi';

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
  religion: z.string().optional(),
  marital_status: z.string().min(1, 'Status pernikahan wajib dipilih'),
  job_id: z.number({ required_error: 'Pekerjaan wajib dipilih' }),
  role_id: z.number({ required_error: 'Hak akses wajib dipilih' }),
  status: z.enum(['Aktif', 'Tidak Aktif', 'Cuti']),
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
  const [triggerCheckNik, { isFetching: isCheckingNik }] = useLazyCheckNikQuery();

  const form = useForm<GuruFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'Aktif',
      gender: 'male',
      first_name: '',
      last_name: '', // Ini akan diperbarui oleh form.reset jika edit mode
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
  const [triggerGetVillagesByDistrict, { data: villagesByDistrict = [] }] = useLazyGetVillageByNikQuery();
  const { data: jobs = [] } = useGetPekerjaanQuery();
  const { data: roles = { data: [] } } = useGetRolesQuery();

  const provinceCode = form.watch('province_code');
  const cityCode = form.watch('city_code');
  const districtCode = form.watch('district_code');
  const nikValue = form.watch('nik');

  // Schema validasi yang berbeda untuk mode tambah dan edit
  const getFormSchema = () => {
    const baseSchema = z.object({
      first_name: z.string().min(1, 'Nama depan wajib diisi'),
      last_name: z.string().min(1, 'Nama belakang wajib diisi'),
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
      religion: z.string().optional(),
      marital_status: z.string().min(1, 'Status pernikahan wajib dipilih'),
      job_id: z.number({ required_error: 'Pekerjaan wajib dipilih' }),
      role_id: z.number({ required_error: 'Hak akses wajib dipilih' }),
      status: z.enum(['Aktif', 'Tidak Aktif', 'Cuti'], { required_error: 'Status kepegawaian wajib dipilih' }),
      photo: z.any().optional(),
    });

    if (isEditMode) {
      // Mode edit: password opsional
      return baseSchema.extend({
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
    } else {
      // Mode tambah: password wajib
      return baseSchema.extend({
        password: z.string().min(8, 'Password minimal 8 karakter'),
        password_confirmation: z.string(),
      }).refine(data => {
        if (data.password !== data.password_confirmation) {
          return false;
        }
        return true;
      }, {
        message: 'Konfirmasi password tidak cocok',
        path: ['password_confirmation'],
      });
    }
  };

  useEffect(() => {
    const handleNikCheck = async () => {
      if (nikValue && nikValue.length === 16) {
        try {
          const result = await triggerCheckNik({ nik: nikValue }).unwrap();
          if (result && result.data) {
            const { data } = result;
            const genderValue = data.gender === 'Laki-laki' ? 'male' : 'female';
            const birthDateValue = new Date(data.birth_date);

            form.setValue('gender', genderValue, { shouldValidate: true });
            form.setValue('birth_date', birthDateValue, { shouldValidate: true });
            form.setValue('birth_place', data.city, { shouldValidate: true });
            form.setValue('province_code', data.province_code, { shouldValidate: true });
            form.setValue('city_code', data.city_code, { shouldValidate: true });
            form.setValue('district_code', data.district_code, { shouldValidate: true });

            toast.showSuccess('Data NIK ditemukan dan berhasil diisikan.');
          }
        } catch (error) {
          toast.showError('Data NIK tidak ditemukan atau terjadi kesalahan.');
          console.error('NIK check failed:', error);
        }
      }
    };

    const timer = setTimeout(() => {
      handleNikCheck();
    }, 500); // Debounce to avoid rapid firing

    return () => clearTimeout(timer);
  }, [nikValue, triggerCheckNik, form]);

  useEffect(() => {
    if (districtCode) {
      triggerGetVillagesByDistrict(districtCode);
    } else {
      // Jika districtCode kosong, pastikan daftar desa juga kosong
      // villagesByDistrict akan otomatis kosong jika query tidak dipanggil
    }
  }, [districtCode, triggerGetVillagesByDistrict]);

  useEffect(() => {
    if (isEditMode && teacherData && jobs.length > 0 && provinces.length > 0) {
      const teacher = teacherData.data; // Ini adalah objek Staff langsung
      // Tidak perlu akses melalui staff karena teacher sudah adalah Staff
      const village = teacher.village; // Mengakses village langsung dari teacher
      const district = village?.district;
      const city = district?.city;
      const province = city?.province;

      // Convert gender from API ('Pria'/'Wanita') to form value ('male'/'female')
      const genderValue = teacher.gender === 'Pria' ? 'male' : 'female';

      // Handle birth_date safely
      let birthDateValue: Date | undefined = undefined;
      if (teacher.birth_date) {
        const parsedDate = new Date(teacher.birth_date);
        // Check if the date is valid
        if (!isNaN(parsedDate.getTime())) {
          birthDateValue = parsedDate;
        }
      }

      // Reset form with teacher data
      form.reset({
        first_name: teacher.first_name, // Langsung dari teacher
        last_name: teacher.last_name || '', // Langsung dari teacher
        nik: teacher.nik || '', // Langsung dari teacher
        nip: teacher.nip || '', // Langsung dari teacher
        gender: genderValue, // Menggunakan nilai yang sudah dikonversi
        phone_number: teacher.phone || '', // Langsung dari teacher (phone, bukan phone_number)
        email: teacher.email, // Langsung dari teacher
        birth_place: teacher.birth_place, // Langsung dari teacher
        birth_date: birthDateValue, // Use the safely parsed date
        address: teacher.address || '', // Langsung dari teacher
        province_code: province?.code,
        city_code: city?.code,
        district_code: district?.code,
        village_code: village?.code,
        religion: teacher.religion, // Langsung dari teacher
        marital_status: teacher.marital_status, // Langsung dari teacher
        job_id: teacher.job_id, // Langsung dari teacher
        role_id: teacher.user?.roles[0]?.id || 0, // Mengakses roles dari teacher.user
        status: teacher.status, // Langsung dari teacher
      });
      if (teacher.photo) { // Langsung dari teacher
        setPhotoPreview(teacher.photo); // Langsung dari teacher
      }
      // Panggil API desa untuk mengisi combobox saat edit mode
      if (district?.code) {
        triggerGetVillagesByDistrict(district.code);
      }
    }
  }, [isEditMode, teacherData, form, triggerGetVillagesByDistrict, jobs.length, provinces.length]);

  const onSubmit = async (values: GuruFormValues) => {
    const formData = new FormData();

    // Mencari nama role berdasarkan role_id yang dipilih
    const selectedRole = roles.data.find(r => r.id === values.role_id);
    const roleName = selectedRole ? selectedRole.name : '';

    // Debug: Cek semua values dari form
    console.log('=== Form Values ===');
    console.log('password:', values.password);
    console.log('password_confirmation:', values.password_confirmation);
    console.log('==================');

    // Validasi data wajib
    if (!values.email || !values.first_name || !values.last_name || !values.status || !roleName) {
      toast.showError('Data wajib tidak lengkap');
      return;
    }

    // Append semua field dengan benar - semua sebagai string untuk Laravel
    formData.append('name', values.email.trim());
    formData.append('first_name', values.first_name.trim());
    formData.append('last_name', values.last_name.trim());
    formData.append('email', values.email.trim());
    formData.append('gender', values.gender === 'male' ? 'Pria' : 'Wanita');
    formData.append('phone', values.phone_number.trim());
    formData.append('address', values.address.trim());
    formData.append('marital_status', values.marital_status);
    formData.append('status', values.status);
    formData.append('village_id', String(values.village_code));
    formData.append('job_id', String(values.job_id));
    formData.append('role', roleName);

    // PASTIKAN password_confirmation selalu dikirim sebagai string
    formData.append('password_confirmation', String(values.password_confirmation || ''));

    // Password - wajib untuk mode tambah
    if (values.password) {
      formData.append('password', String(values.password));
    } else if (!isEditMode) {
      toast.showError('Password wajib diisi untuk guru baru');
      return;
    }

    // Optional fields
    if (values.nip) formData.append('nip', values.nip.trim());
    if (values.nik) formData.append('nik', values.nik.trim());
    if (values.birth_date) formData.append('birth_date', format(values.birth_date, 'yyyy-MM-dd'));
    if (values.birth_place) formData.append('birth_place', values.birth_place.trim());
    if (values.religion) formData.append('religion', values.religion.trim());

    // Photo
    if (values.photo instanceof File) {
      formData.append('photo', values.photo);
    }

    // Debug log untuk melihat isi FormData
    console.log('=== FormData Contents ===');
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]} (${typeof pair[1]})`);
    }
    console.log('========================');

    try {
      if (isEditMode && id) {
        await updateTeacher({ id, data: formData }).unwrap();
        toast.showSuccess('Data guru berhasil diperbarui!');
      } else {
        await addTeacher(formData).unwrap();
        toast.showSuccess('Guru baru berhasil ditambahkan!');
      }
      navigate('/dashboard/manajemen-kurikulum/guru');
    } catch (error: any) {
      console.error('Error saving teacher:', error);
      
      // Tampilkan pesan error yang lebih detail
      if (error.data?.errors) {
        const errorMessages = Object.entries(error.data.errors)
          .map(([field, messages]: [string, any]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        toast.showError(`Validasi gagal:\n${errorMessages}`);
      } else if (error.data?.message) {
        toast.showError(error.data.message);
      } else {
        toast.showError('Gagal menyimpan data guru.');
      }
    }
  };

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/administrasi' },
    { label: 'Manajemen Kurikulum' },
    { label: 'Guru', href: '/dashboard/manajemen-kurikulum/guru' },
    { label: isEditMode ? 'Edit Guru' : 'Tambah Guru', icon: <User className="h-4 w-4" /> },
  ];

  const isLoading = isAdding || isUpdating || isLoadingTeacher || isCheckingNik;

  const filteredCities = useMemo(() => cities.filter(c => c.province_code === provinceCode), [cities, provinceCode]);
  const filteredDistricts = useMemo(() => districts.filter(d => d.city_code === cityCode), [districts, cityCode]);
  const filteredVillages = useMemo(() => {
    if (!districtCode) {
      return [];
    }
    return villagesByDistrict;
  }, [villagesByDistrict, districtCode]);

  const stepFields: (keyof GuruFormValues)[][] = [
    ['first_name', 'gender', 'phone_number', 'email', 'birth_place', 'birth_date'],
    ['address', 'province_code', 'city_code', 'district_code', 'village_code'],
    ['marital_status', 'job_id', 'role_id', 'status', 'password', 'password_confirmation'],
  ];

  const steps = [
    { name: 'Profil Guru', component: <GuruProfileStep form={form} photoPreview={photoPreview} setPhotoPreview={setPhotoPreview} isCheckingNik={isCheckingNik} /> },
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
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && currentStep < steps.length - 1) {
                      e.preventDefault(); // Mencegah pengiriman formulir saat Enter ditekan pada langkah perantara
                    }
                  }}
                >
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