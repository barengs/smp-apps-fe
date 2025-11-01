import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentEditSchema } from '@/validation/studentSchema';
import { useGetStudentByIdQuery, useUpdateStudentMutation, type Student, type CreateUpdateStudentRequest } from '@/store/slices/studentApi';
import * as toast from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Save } from 'lucide-react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useGetHostelsQuery } from '@/store/slices/hostelApi';
import { useGetProgramsQuery } from '@/store/slices/programApi';
import PhotoDropzone from '@/components/PhotoDropzone';
import FormStepIndicator from '@/components/FormStepIndicator';

const toDateInputValue = (value?: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  // Format YYYY-MM-DD
  return date.toISOString().slice(0, 10);
};

const SantriEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const santriId = parseInt(id || '', 10);

  if (isNaN(santriId)) {
    toast.showError('ID santri tidak valid.');
    navigate('/dashboard/santri');
    return null;
  }

  const { data: santri, isLoading, error } = useGetStudentByIdQuery(santriId);
  const [updateStudent, { isLoading: isSaving }] = useUpdateStudentMutation();

  // Ambil opsi Asrama dan Program
  const { data: hostelPage, isLoading: isHostelLoading } = useGetHostelsQuery();
  const hostelOptions = (hostelPage?.data ?? []).map((h) => ({ value: String(h.id), label: h.name }));

  const { data: programPage, isLoading: isProgramLoading } = useGetProgramsQuery({ page: 1, per_page: 100 });
  const programOptions = (programPage?.data ?? []).map((p) => ({ value: String(p.id), label: p.name }));

  const form = useForm<CreateUpdateStudentRequest>({
    defaultValues: {
      parent_id: '',
      nis: '',
      period: '',
      nik: '',
      kk: '',
      first_name: '',
      last_name: '',
      gender: 'L',
      address: '',
      born_in: '',
      born_at: '',
      last_education: '',
      village_id: undefined,
      village: '',
      district: '',
      postal_code: '',
      phone: '',
      hostel_id: undefined,
      program_id: undefined,
      status: '',
      photo: '',
      user_id: undefined,
      deleted_at: undefined,
    },
    resolver: zodResolver(studentEditSchema),
  });

  // ADDED: state untuk step wizard
  const steps = ['Data Pribadi', 'Alamat & Kontak', 'Asrama & Program', 'Foto'];
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (santri) {
      form.reset({
        parent_id: santri.parent_id ?? '',
        nis: santri.nis ?? '',
        period: santri.period ?? '',
        nik: santri.nik ?? '',
        kk: santri.kk ?? '',
        first_name: santri.first_name ?? '',
        last_name: santri.last_name ?? '',
        gender: santri.gender ?? 'L',
        address: santri.address ?? '',
        born_in: santri.born_in ?? '',
        born_at: toDateInputValue(santri.born_at),
        last_education: santri.last_education ?? '',
        village_id: santri.village_id ?? undefined,
        village: santri.village ?? '',
        district: santri.district ?? '',
        postal_code: santri.postal_code ?? '',
        phone: santri.phone ?? '',
        hostel_id: santri.hostel_id ?? undefined,
        program_id: santri.program_id ?? undefined,
        status: santri.status ?? '',
        photo: santri.photo ?? '',
        user_id: santri.user_id ?? undefined,
        deleted_at: santri.deleted_at ?? undefined,
      });
    }
  }, [santri, form]);

  const handleSubmit = async (values: CreateUpdateStudentRequest) => {
    // Pastikan tipe numerik benar
    const payload: CreateUpdateStudentRequest = {
      ...values,
      village_id: values.village_id !== undefined && values.village_id !== null && values.village_id !== ('' as any)
        ? Number(values.village_id)
        : undefined,
      hostel_id: values.hostel_id !== undefined && values.hostel_id !== null && values.hostel_id !== ('' as any)
        ? Number(values.hostel_id)
        : undefined,
      program_id: values.program_id !== undefined && values.program_id !== null && values.program_id !== ('' as any)
        ? Number(values.program_id)
        : undefined,
      user_id: values.user_id !== undefined && values.user_id !== null && values.user_id !== ('' as any)
        ? Number(values.user_id)
        : undefined,
      born_at: values.born_at || undefined,
    };

    const result = await updateStudent({ id: santriId, data: payload });

    if ('data' in result) {
      toast.showSuccess('Data santri berhasil diperbarui.');
      navigate(`/dashboard/santri/${santriId}`);
    } else {
      const errData: any = (result as any).error?.data;
      const backendErrors = errData?.errors;
      if (backendErrors && typeof backendErrors === 'object') {
        Object.entries(backendErrors).forEach(([field, messages]) => {
          const message = Array.isArray(messages) ? messages[0] : String(messages);
          form.setError(field as keyof CreateUpdateStudentRequest, { type: 'server', message });
        });
        toast.showError('Validasi gagal. Mohon periksa field yang ditandai.');
      } else {
        toast.showError('Gagal memperbarui data santri.');
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Edit Santri" role="administrasi">
        <div className="container mx-auto py-4 px-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !santri) {
    toast.showError('Gagal memuat data santri untuk edit.');
    navigate('/dashboard/santri');
    return null;
  }

  return (
    <DashboardLayout title="Edit Santri" role="administrasi">
      <div className="container mx-auto pb-6 px-4">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Edit Data Santri</CardTitle>
                <CardDescription>Perbarui informasi santri sesuai kebutuhan.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/dashboard/santri/${santriId}`)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
                </Button>
                <Button
                  onClick={form.handleSubmit(handleSubmit)}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" /> Simpan
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-4">
                {/* ADDED: Indikator langkah */}
                <FormStepIndicator steps={steps} currentStep={currentStep} />

                {/* REPLACED: Tabs -> Konten per langkah */}
                {currentStep === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NIS</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nik"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NIK</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="kk"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor KK</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Depan</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jenis Kelamin</FormLabel>
                          <FormControl>
                            <RadioGroup
                              className="flex flex-wrap gap-4"
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="L" id="gender-l" />
                                <label htmlFor="gender-l" className="text-sm">Laki-Laki</label>
                              </div>
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="P" id="gender-p" />
                                <label htmlFor="gender-p" className="text-sm">Perempuan</label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value ?? ''}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-full h-10">
                                <SelectValue placeholder="Pilih Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                                <SelectItem value="Aktif">Aktif</SelectItem>
                                <SelectItem value="Tugas">Tugas</SelectItem>
                                <SelectItem value="Lulus">Lulus</SelectItem>
                                <SelectItem value="Dikeluarkan">Dikeluarkan</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="born_in"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tempat Lahir</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="born_at"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal Lahir</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_education"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pendidikan Terakhir</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alamat</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="village_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID Desa</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              value={field.value ?? ''}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === '' ? undefined : Number(e.target.value)
                                )
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="village"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Desa</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kecamatan</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postal_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kode Pos</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. Telepon</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="period"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Periode</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Misal: 2024/2025" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="parent_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NIK Wali Santri</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Masukkan NIK Wali (opsional)" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hostel_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asrama</FormLabel>
                          <FormControl>
                            <Select
                              value={
                                field.value !== undefined && field.value !== null
                                  ? String(field.value)
                                  : ''
                              }
                              onValueChange={(v) => field.onChange(Number(v))}
                              disabled={isHostelLoading}
                            >
                              <SelectTrigger className="w-full h-10">
                                <SelectValue placeholder={isHostelLoading ? 'Memuat asrama...' : 'Pilih Asrama'} />
                              </SelectTrigger>
                              <SelectContent>
                                {hostelOptions.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="program_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Program</FormLabel>
                          <FormControl>
                            <Select
                              value={
                                field.value !== undefined && field.value !== null
                                  ? String(field.value)
                                  : ''
                              }
                              onValueChange={(v) => field.onChange(Number(v))}
                              disabled={isProgramLoading}
                            >
                              <SelectTrigger className="w-full h-10">
                                <SelectValue placeholder={isProgramLoading ? 'Memuat program...' : 'Pilih Program'} />
                              </SelectTrigger>
                              <SelectContent>
                                {programOptions.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="photo"
                      render={({ field }) => (
                        <FormItem>
                          <PhotoDropzone
                            value={field.value ?? ''}
                            onChange={(dataUrl) => field.onChange(dataUrl ?? '')}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* ADDED: Navigasi langkah */}
                <div className="mt-4 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                    disabled={currentStep === 0}
                  >
                    Sebelumnya
                  </Button>
                  <div className="flex gap-2">
                    {currentStep < steps.length - 1 ? (
                      <Button
                        type="button"
                        onClick={() => setCurrentStep((s) => Math.min(steps.length - 1, s + 1))}
                      >
                        Berikutnya
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={form.handleSubmit(handleSubmit)}
                        disabled={isSaving}
                      >
                        <Save className="h-4 w-4 mr-2" /> Simpan
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SantriEditPage;