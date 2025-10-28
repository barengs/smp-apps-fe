import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { ArrowLeft, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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

  const handleSubmit = async (values: CreateUpdateParentRequest) => {
    const payload: CreateUpdateParentRequest = {
      email: values.email,
      parent: {
        ...values.parent,
        occupation_id: values.parent.occupation_id ?? null,
        education_id: values.parent.education_id ?? null,
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
                <CardDescription>Perbarui informasi wali santri.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate(`/dashboard/wali-santri/${parentId}`)}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
                </Button>
                <Button onClick={form.handleSubmit(handleSubmit)} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" /> Simpan
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  rules={{ required: 'Email akun wajib diisi' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Akun</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email akun wali (login)" {...field} />
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. KK</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

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
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WaliSantriEditPage;