import React from 'react';
import { Controller, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import { CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';

interface GuruAddressStepProps {
  form: UseFormReturn<any>;
  provinces: { value: string; label: string }[];
  cities: { value: string; label: string }[];
  districts: { value: string; label: string }[];
  villages: { value: string; label: string }[];
  isCityDisabled: boolean;
  isDistrictDisabled: boolean;
  isVillageDisabled: boolean;
}

const GuruAddressStep: React.FC<GuruAddressStepProps> = ({
  form,
  provinces,
  cities,
  districts,
  villages,
  isCityDisabled,
  isDistrictDisabled,
  isVillageDisabled,
}) => {
  return (
    <div className="space-y-6">
      <CardTitle className="text-lg">Informasi Alamat</CardTitle>
      <FormField name="address" control={form.control} render={({ field }) => (<FormItem><FormLabel>Alamat Lengkap</FormLabel><FormControl><Textarea placeholder="Nama jalan, nomor rumah, RT/RW..." {...field} /></FormControl><FormMessage /></FormItem>)} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Controller name="province_code" control={form.control} render={({ field }) => (<FormItem><FormLabel>Provinsi</FormLabel><Combobox options={provinces} value={field.value} onChange={field.onChange} placeholder="Pilih Provinsi" /><FormMessage /></FormItem>)} />
        <Controller name="city_code" control={form.control} render={({ field }) => (<FormItem><FormLabel>Kota/Kabupaten</FormLabel><Combobox options={cities} value={field.value} onChange={field.onChange} placeholder="Pilih Kota/Kabupaten" disabled={isCityDisabled} /><FormMessage /></FormItem>)} />
        <Controller name="district_code" control={form.control} render={({ field }) => (<FormItem><FormLabel>Kecamatan</FormLabel><Combobox options={districts} value={field.value} onChange={field.onChange} placeholder="Pilih Kecamatan" disabled={isDistrictDisabled} /><FormMessage /></FormItem>)} />
        <Controller name="village_code" control={form.control} render={({ field }) => (<FormItem><FormLabel>Desa/Kelurahan</FormLabel><Combobox options={villages} value={field.value} onChange={field.onChange} placeholder="Pilih Desa/Kelurahan" disabled={isVillageDisabled} /><FormMessage /></FormItem>)} />
      </div>
    </div>
  );
};

export default GuruAddressStep;