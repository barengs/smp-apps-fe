import React, { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUpdateProfileMutation } from '@/store/slices/authApi';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { Loader2, Camera, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { User as UserType } from '@/store/slices/authApi'; // Import User type from authApi
import { CreateUpdateEmployeeRequest } from '@/store/slices/employeeApi'; // Import CreateUpdateEmployeeRequest

interface ProfileEditFormProps {
  userFullData: UserType; // Now receives the full User object
}

const formSchema = z.object({
  first_name: z.string().min(1, 'Nama depan harus diisi.'),
  last_name: z.string().optional(),
  nik: z.string().min(1, 'NIK harus diisi.'), // Made NIK required
  phone: z.string().min(1, 'Telepon harus diisi.'), // Made Phone required
  address: z.string().min(1, 'Alamat harus diisi.'), // Made Address required
  zip_code: z.string().optional(),
  photo: z.instanceof(File).optional(),
});

type ProfileFormValues = z.infer<typeof formSchema>;

// Helper to convert base64 to File (still needed if we re-introduce photo upload later)
const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) throw new Error('Invalid data URL');
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ userFullData }) => {
  const navigate = useNavigate();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [photoPreview, setPhotoPreview] = useState<string | null>(userFullData.profile?.photo || null);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: userFullData.profile?.first_name || '',
      last_name: userFullData.profile?.last_name || '',
      nik: userFullData.profile?.nik || '', // Set default for NIK
      phone: userFullData.profile?.phone || '', // Set default for Phone
      address: userFullData.profile?.address || '', // Set default for Address
      zip_code: userFullData.profile?.zip_code || '',
      photo: undefined,
    },
  });

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setPhotoPreview(imageSrc);
      form.setValue('photo', undefined, { shouldValidate: true }); // Clear file input
      setIsWebcamOpen(false);
    }
  }, [webcamRef, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    // Construct the payload as a JSON object matching CreateUpdateEmployeeRequest
    const payload: CreateUpdateEmployeeRequest = {
      first_name: values.first_name,
      last_name: values.last_name || '',
      email: userFullData.email, // Use top-level email from userFullData
      nik: values.nik, // Use NIK from form values
      phone: values.phone, // Use Phone from form values
      address: values.address, // Use Address from form values
      zip_code: values.zip_code || '',
      code: userFullData.profile?.code || '', // Use code from userFullData.profile
      username: userFullData.username, // Use username from userFullData
      roles: userFullData.roles.map(role => role.name), // Map roles to string array
      // password is not included for update operations unless explicitly changed
    };

    // Temporarily remove photo handling from here to isolate the issue
    // if (capturedImage) {
    //   const photoFile = dataURLtoFile(capturedImage, 'webcam-photo.jpg');
    //   payload.photo = photoFile; // This would require photo field in CreateUpdateEmployeeRequest
    // } else if (values.photo) {
    //   payload.photo = values.photo; // This would require photo field in CreateUpdateEmployeeRequest
    // }
    
    try {
      await updateProfile({ id: userFullData.id, data: payload }).unwrap(); // Pass the JSON payload as 'data'
      showSuccess('Profil berhasil diperbarui.');
      navigate('/dashboard/profile');
    } catch (err) {
      showError('Gagal memperbarui profil.');
      console.error(err);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Edit Profil</CardTitle>
          <CardDescription>Perbarui informasi profil Anda di bawah ini.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Photo */}
                <div className="md:col-span-1 space-y-4">
                  <FormField
                    control={form.control}
                    name="photo"
                    render={({ field: { onChange, ref, value, ...rest } }) => ( // Destructure value to exclude it
                      <FormItem>
                        <FormLabel>Foto Profil</FormLabel>
                        <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden border">
                          {photoPreview ? (
                            <img src={photoPreview} alt="Pratinjau Profil" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-24 h-24 text-muted-foreground" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                onChange(file || undefined);
                                if (file) {
                                  setPhotoPreview(URL.createObjectURL(file));
                                  setCapturedImage(null);
                                }
                              }}
                              ref={ref} // Pass ref
                              {...rest} // 'rest' no longer contains 'value'
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="outline" className="w-full" onClick={() => setIsWebcamOpen(true)}>
                    <Camera className="mr-2 h-4 w-4" /> Ambil dari Kamera
                  </Button>
                </div>

                {/* Right Column: Other fields */}
                <div className="md:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Depan</FormLabel>
                          <FormControl><Input placeholder="John" {...field} /></FormControl>
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
                          <FormControl><Input placeholder="Doe" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input value={userFullData.email} disabled /></FormControl>
                  </FormItem>
                  <FormField
                    control={form.control}
                    name="nik"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIK</FormLabel>
                        <FormControl><Input placeholder="1234567890123456" {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telepon</FormLabel>
                        <FormControl><Input placeholder="08123456789" {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alamat</FormLabel>
                        <FormControl><Textarea placeholder="Jl. Merdeka No. 1" {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zip_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode Pos</FormLabel>
                        <FormControl><Input placeholder="12345" {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate('/dashboard/profile')} disabled={isLoading}>
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={isWebcamOpen} onOpenChange={setIsWebcamOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ambil Foto dari Kamera</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={450}
              height={300}
              className="rounded-md"
              videoConstraints={{ facingMode: 'user', width: 1280, height: 720 }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWebcamOpen(false)}>Batal</Button>
            <Button onClick={capturePhoto}>Ambil Gambar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileEditForm;