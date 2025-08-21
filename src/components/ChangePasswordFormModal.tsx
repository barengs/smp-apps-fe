import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useChangePasswordMutation, ChangePasswordRequest } from '@/store/slices/authApi';
import { showSuccess, showError } from '@/utils/toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface ChangePasswordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to determine password strength
const getPasswordStrength = (password: string) => {
  let strength = 0;

  if (password.length >= 6) {
    strength += 1;
  }
  if (/[a-z]/.test(password)) {
    strength += 1;
  }
  if (/[A-Z]/.test(password)) {
    strength += 1;
  }
  if (/\d/.test(password)) {
    strength += 1;
  }

  let strengthText = 'Sangat Lemah';
  let progressValue = 0;
  let progressColor = 'bg-red-500';

  if (strength === 1) {
    strengthText = 'Lemah';
    progressValue = 25;
    progressColor = 'bg-red-500';
  } else if (strength === 2) {
    strengthText = 'Sedang';
    progressValue = 50;
    progressColor = 'bg-orange-500';
  } else if (strength === 3) {
    strengthText = 'Cukup Kuat';
    progressValue = 75;
    progressColor = 'bg-yellow-500';
  } else if (strength === 4) {
    strengthText = 'Sangat Kuat';
    progressValue = 100;
    progressColor = 'bg-green-500';
  }

  return { strengthText, progressValue, progressColor };
};

const formSchema = z.object({
  current_password: z.string().min(1, { message: 'Password saat ini harus diisi.' }),
  new_password: z.string()
    .min(6, { message: 'Password baru minimal 6 karakter.' })
    .regex(/[a-z]/, { message: 'Password baru harus mengandung setidaknya satu huruf kecil.' })
    .regex(/[A-Z]/, { message: 'Password baru harus mengandung setidaknya satu huruf besar.' })
    .regex(/\d/, { message: 'Password baru harus mengandung setidaknya satu angka.' }),
  new_password_confirmation: z.string(),
}).refine((data) => data.new_password === data.new_password_confirmation, {
  message: "Konfirmasi password tidak cocok.",
  path: ["new_password_confirmation"], // Set error on the confirmation field
});

type ChangePasswordFormValues = z.infer<typeof formSchema>;

const ChangePasswordFormModal: React.FC<ChangePasswordFormModalProps> = ({ isOpen, onClose }) => {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    strengthText: '',
    progressValue: 0,
    progressColor: '',
  });

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    },
  });

  // Reset form and strength indicator when modal closes
  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setNewPasswordValue('');
      setPasswordStrength({
        strengthText: '',
        progressValue: 0,
        progressColor: '',
      });
    }
  }, [isOpen, form]);

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      const response = await changePassword(values as ChangePasswordRequest).unwrap();
      showSuccess(response.message || 'Password berhasil diubah.');
      onClose();
      form.reset();
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Gagal mengubah password. Silakan coba lagi.';
      showError(errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ganti Password</DialogTitle>
          <DialogDescription>
            Masukkan password Anda saat ini dan password baru.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Saat Ini</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pr-10"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Baru</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pr-10"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setNewPasswordValue(e.target.value);
                          setPasswordStrength(getPasswordStrength(e.target.value));
                        }}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {newPasswordValue.length > 0 && (
                    <div className="mt-2">
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-in-out"
                          style={{ width: `${passwordStrength.progressValue}%`, backgroundColor: passwordStrength.progressColor }}
                        />
                      </div>
                      <p className="text-sm mt-1" style={{ color: passwordStrength.progressColor }}>
                        Kekuatan Password: {passwordStrength.strengthText}
                      </p>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="new_password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konfirmasi Password Baru</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showConfirmNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pr-10"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    >
                      {showConfirmNewPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Password
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordFormModal;