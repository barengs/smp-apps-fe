import React from 'react';
import { UseFormReturn, Controller } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';

interface GuruEmploymentStepProps {
  form: UseFormReturn<any>;
  jobs: { value: number; label: string }[];
  roles: { value: number; label: string }[];
  isEditMode: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
}

const GuruEmploymentStep: React.FC<GuruEmploymentStepProps> = ({
  form,
  jobs,
  roles,
  isEditMode,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
}) => {
  return (
    <div className="space-y-6">
      <CardTitle className="text-lg">Informasi Kepegawaian</CardTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bidang Agama dihapus */}
        <FormField name="marital_status" control={form.control} render={({ field }) => (<FormItem><FormLabel>Status Pernikahan *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Belum Menikah">Belum Menikah</SelectItem><SelectItem value="Menikah">Menikah</SelectItem><SelectItem value="Duda">Duda</SelectItem><SelectItem value="Janda">Janda</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
        <Controller name="job_id" control={form.control} render={({ field }) => (<FormItem><FormLabel>Pekerjaan *</FormLabel><Combobox options={jobs} value={field.value} onChange={field.onChange} placeholder="Pilih Pekerjaan" /><FormMessage /></FormItem>)} />
        <Controller name="role_id" control={form.control} render={({ field }) => (<FormItem><FormLabel>Hak Akses *</FormLabel><Combobox options={roles} value={field.value} onChange={field.onChange} placeholder="Pilih Hak Akses" /><FormMessage /></FormItem>)} />
        <FormField name="status" control={form.control} render={({ field }) => (<FormItem><FormLabel>Status Kepegawaian *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Aktif">Aktif</SelectItem><SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem><SelectItem value="Cuti">Cuti</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
      </div>

      <div className="space-y-6 pt-6">
        <CardTitle className="text-lg">Informasi Akun</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField name="username" control={form.control} render={({ field }) => (<FormItem><FormLabel>Username *</FormLabel><FormControl><Input type="text" {...field} placeholder="Masukkan username" /></FormControl><FormMessage /></FormItem>)} />
          <FormField name="password" control={form.control} render={({ field }) => (<FormItem><FormLabel>{isEditMode ? 'Password Baru (Opsional)' : 'Password *'}</FormLabel><FormControl><div className="relative"><Input type={showPassword ? 'text' : 'password'} {...field} placeholder={isEditMode ? "Kosongkan jika tidak ingin mengubah" : "Masukkan password"} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></FormControl><FormMessage /></FormItem>)} />
          <FormField name="password_confirmation" control={form.control} render={({ field }) => (<FormItem><FormLabel>Konfirmasi Password *</FormLabel><FormControl><div className="relative"><Input type={showConfirmPassword ? 'text' : 'password'} {...field} placeholder="Ulangi password" /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></FormControl><FormMessage /></FormItem>)} />
        </div>
      </div>
    </div>
  );
};

export default GuruEmploymentStep;