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
      <div className="md:col-span-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Masukkan username"
                    disabled={isCheckingNik}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Depan *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Masukkan nama depan"
                    disabled={isCheckingNik}
                  />
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
                <FormLabel>Nama Belakang *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Masukkan nama belakang"
                    disabled={isCheckingNik}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Kelamin *</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-row space-y-1"
                    disabled={isCheckingNik}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <FormLabel htmlFor="male" className="font-normal">
                        Laki-laki
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <FormLabel htmlFor="female" className="font-normal">
                        Perempuan
                      </FormLabel>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Telepon *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Masukkan nomor telepon"
                    disabled={isCheckingNik}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Masukkan email"
                    disabled={isCheckingNik}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birth_place"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tempat Lahir *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Masukkan tempat lahir"
                    disabled={isCheckingNik}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birth_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Lahir *</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isCheckingNik}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default GuruProfileStep;