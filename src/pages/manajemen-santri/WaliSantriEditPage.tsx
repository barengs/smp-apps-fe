import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useGetParentByIdQuery, useUpdateParentMutation, type CreateUpdateParentRequest } from '@/store/slices/parentApi';
import { useGetPekerjaanQuery } from '@/store/slices/pekerjaanApi';
import { useGetEducationLevelsQuery } from '@/store/slices/educationApi';
import * as toast from '@/utils/toast';
import { ArrowLeft, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import FormStepIndicator from '@/components/FormStepIndicator';

// Helper validasi untuk email dan NIK
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v ?? '').trim());
const isNik = (v: string) => /^\d{8,20}$/.test((v ?? '').trim());

const WaliSantriEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const parentId = useMemo(() => parseInt(id || '', 10), [id]);

  useEffect(() => {
    if (isNaN(parentId)) {
      toast.showError('ID Wali Santri tidak valid.');
      navigate('/dashboard/wali-santri-list');
    }
  }, [parentId, navigate]);

  const { data: parentData, isLoading: isParentLoading } = useGetParentByIdQuery(parentId, { skip: isNaN(parentId), refetchOnMountOrArgChange: true });
  const { data: pekerjaanList = [], isLoading: isPekerjaanLoading } = useGetPekerjaanQuery();
  const { data: educationList = [], isLoading: isEducationLoading } = useGetEducationLevelsQuery({} as any);
  const [updateParent, { isLoading: isSaving }] = useUpdateParentMutation();

  const steps = ['Akun & Identitas', 'Kontak, Alamat & Pendidikan'];
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<CreateUpdateParentRequest>({
    defaultValues: {
      email: '',
      parent: {
        first_name: '',
        last_name: '',
        kk: '',
        nik: '',
        gender: 'L',
        parent_as: 'ayah',
        phone: '',
        email: '',
        domicile_address: '',
        card_address: '',
        occupation_id: null,
        education_id: null,
      },
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (parentData) {
      form.reset({
        email: parentData.email || '',
        parent: {
          first_name: parentData.parent.first_name || '',
          last_name: parentData.parent.last_name || '',
          kk: parentData.parent.kk || '',
          nik: parentData.parent.nik || '',
          gender: parentData.parent.gender || 'L',
          parent_as: (parentData.parent.parent_as || 'ayah').toLowerCase(),
          phone: parentData.parent.phone || '',
          email: parentData.parent.email || parentData.email || '',
          domicile_address: parentData.parent.domicile_address || '',
          card_address: parentData.parent.card_address || '',
          occupation_id: parentData.parent.occupation_id ?? null,
          education_id: parentData.parent.education_id ?? null,
        },
      });
    }
  }, [parentData, form]);

  const stepFieldNames: Record<number, (keyof CreateUpdateParentRequest | string)[]> = {
    0: ['email', 'parent.first_name', 'parent.gender', 'parent.parent_as', 'parent.nik', 'parent.kk'],
    1: [
      'parent.phone', 'parent.email',
      'parent.domicile_address', 'parent.card_address',
      'parent.occupation_id', 'parent.education_id'
    ],
  };

  const goNext = async () => {
    const fields = stepFieldNames[currentStep] ?? [];
    const valid = await form.trigger(fields as any, { shouldFocus: true });
    if (!valid) {
      toast.showError('Mohon lengkapi bagian ini sebelum lanjut.');
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const goBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async (values: CreateUpdateParentRequest) => {
    const loginValue = (values.email || '').trim();
    const treatingAsNik = loginValue && isNik(loginValue) && !isEmail(loginValue);

    const payload: CreateUpdateParentRequest = {
      // Sesuai kebutuhan: field ini dapat berupa email atau NIK
      email: loginValue,
      parent: {
        ...values.parent,
        nik: treatingAsNik ? loginValue : values.parent.nik,
        occupation_id: values.parent.occupation_id ?? null,
        education_id: values.parent.education_id ?? null,
        last_name: values.parent.last_name ?? null,
        phone: values.parent.phone ?? null,
        domicile_address: values.parent.domicile_address ?? null,
        card_address: values.parent.card_address ?? null,
        email: values.parent.email ?? null,
      },
    };

    const result = await updateParent({ id: parentId, data: payload }).unwrap();
    if (result) {
      toast.showSuccess('Data wali santri berhasil diperbarui.');
      navigate(`/dashboard/wali-santri/${parentId}`);
    }
  };

  if (isParentLoading) {
    return (
      <DashboardLayout title="Edit Wali Santri" role="administrasi">
        <div className="container mx-auto pb-6 px-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/3" />
              <Skeleton className="h-4 w-2/3 mt-2" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Wali Santri" role="administrasi">
      <div className="container mx-auto pb-6 px-4">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Edit Wali Santri</CardTitle>
                <CardDescription>Perbarui informasi wali santri melalui langkah-langkah yang mudah.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate(`/dashboard/wali-santri/${parentId}`)}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
                </Button>
              </div>
            </div>
            <FormStepIndicator steps={steps} currentStep={currentStep} />
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form className="space-y-6">
                {currentStep === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      rules={{
                        required: 'Email akun atau NIK wajib diisi',
                        validate: (v: string) =>
                          isEmail((v ?? '').trim()) || isNik((v ?? '').trim()) || 'Masukkan email akun yang valid atau NIK (angka)',
                      }}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Email Akun atau NIK</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="Contoh: nama@contoh.com atau 3276XXXXXXXXXXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="parent.first_name"
                      rules={{ required: 'Nama depan wajib diisi' }}
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
                      name="parent.last_name"
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
                      name="parent.gender"
                      rules={{ required: 'Jenis kelamin wajib diisi' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jenis Kelamin</FormLabel>
                          <FormControl>
                            <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-6">
                              <div className="flex items-center gap-2">
                                <RadioGroupItem id="gender-l" value="L" />
                                <label htmlFor="gender-l" className="text-sm">Laki-Laki</label>
                              </div>
                              <div className="flex items-center gap-2">
                                <RadioGroupItem id="gender-p" value="P" />
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
                      name="parent.parent_as"
                      rules={{ required: 'Status wali wajib diisi' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status Wali</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih status wali" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ayah">Ayah</SelectItem>
                                <SelectItem value="ibu">Ibu</SelectItem>
                                <SelectItem value="wali">Wali</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="parent.nik"
                      rules={{ required: 'NIK wajib diisi' }}
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
                      name="parent.kk"
                      rules={{ required: 'No. KK wajib diisi' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. KK</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="parent.phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>No. Telepon</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="parent.email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Wali</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Email untuk kontak wali" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="parent.domicile_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alamat Domisili</FormLabel>
                            <FormControl>
                              <Textarea rows={3} {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="parent.card_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alamat KTP</FormLabel>
                            <FormControl>
                              <Textarea rows={3} {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="parent.occupation_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pekerjaan</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value !== null && field.value !== undefined ? String(field.value) : ''}
                                onValueChange={(v) => field.onChange(v ? Number(v) : null)}
                                disabled={isPekerjaanLoading}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder={isPekerjaanLoading ? 'Memuat pekerjaan...' : 'Pilih pekerjaan'} />
                                </SelectTrigger>
                                <SelectContent>
                                  {pekerjaanList.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>
                                      {p.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="parent.education_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pendidikan</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value !== null && field.value !== undefined ? String(field.value) : ''}
                                onValueChange={(v) => field.onChange(v ? Number(v) : null)}
                                disabled={isEducationLoading}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder={isEducationLoading ? 'Memuat pendidikan...' : 'Pilih pendidikan'} />
                                </SelectTrigger>
                                <SelectContent>
                                  {educationList.map((e) => (
                                    <SelectItem key={e.id} value={String(e.id)}>
                                      {e.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Langkah {currentStep + 1} dari {steps.length}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={goBack} disabled={currentStep === 0 || isSaving}>
                <ChevronLeft className="h-4 w-4 mr-2" /> Sebelumnya
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button onClick={goNext} disabled={isSaving}>
                  Lanjut <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={form.handleSubmit(handleSubmit)} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" /> Simpan
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WaliSantriEditPage;