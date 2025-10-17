import React from 'react';
import { UseFormReturn, Controller } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DatePicker } from '@/components/ui/datepicker';
import ProfilePhotoCard from '@/components/ProfilePhotoCard';
import { Loader2 } from 'lucide-react';

interface GuruProfileStepProps {
  form: UseFormReturn<any>;
  photoPreview: string | null;
  setPhotoPreview: (url: string | null) => void;
  isCheckingNik: boolean;
}

const GuruProfileStep: React.FC<GuruProfileStepProps> = ({ form, photoPreview, setPhotoPreview, isCheckingNik }) => {
  const handleCapture = (imageSrc: string) => {
    // Simpan sebagai string (data URL), bukan File
    form.setValue('photo', imageSrc, { shouldValidate: true });
    setPhotoPreview(imageSrc);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1 flex flex-col items-center">
        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-center block mb-2">Foto Profil</FormLabel>
              <FormControl>
                <div className="flex flex-col items-center gap-4">
                  <ProfilePhotoCard photoUrl={photoPreview} onCapture={handleCapture} />
                  <div className="text-sm text-muted-foreground">atau</div>
                  <Input
                    type="file"
                    className="max-w-xs"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const result = reader.result as string;
                          // Simpan nilai form sebagai string (data URL)
                          field.onChange(result);
                          setPhotoPreview(result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField name="first_name" control={form.control} render={({ field }) => (<FormItem><FormLabel>Nama Depan</FormLabel><FormControl><Input placeholder="Nama Depan" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField name="last_name" control={form.control} render={({ field }) => (<FormItem><FormLabel>Nama Belakang</FormLabel><FormControl><Input placeholder="Nama Belakang" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField
          name="nik"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>NIK</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input placeholder="16 digit NIK" {...field} />
                  {isCheckingNik && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField name="nip" control={form.control} render={({ field }) => (<FormItem><FormLabel>NIP</FormLabel><FormControl><Input placeholder="NIP (jika ada)" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField name="gender" control={form.control} render={({ field }) => (<FormItem><FormLabel>Jenis Kelamin</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Laki-laki</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Perempuan</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
        <FormField name="phone_number" control={form.control} render={({ field }) => (<FormItem><FormLabel>Nomor Telepon</FormLabel><FormControl><Input placeholder="08..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField name="email" control={form.control} render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="contoh@email.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField name="birth_place" control={form.control} render={({ field }) => (<FormItem><FormLabel>Tempat Lahir</FormLabel><FormControl><Input placeholder="Kota Kelahiran" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Controller name="birth_date" control={form.control} render={({ field }) => (<FormItem><FormLabel>Tanggal Lahir</FormLabel><FormControl><DatePicker value={field.value} onValueChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
      </div>
    </div>
  );
};

export default GuruProfileStep;