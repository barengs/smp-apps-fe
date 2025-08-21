import React from 'react';
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
import { Loader2 } from 'lucide-react';

interface ChangePasswordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  current_password: z.string().min(1, { message: 'Password saat ini harus diisi.' }),
  new_password: z.string().min(8, { message: 'Password baru minimal 8 karakter.' }),
  new_password_confirmation: z.string(),
}).refine((data) => data.new_password === data.new_password_confirmation, {
  message: "Konfirmasi password tidak cocok.",
  path: ["new_password_confirmation"], // Set error on the confirmation field
});

type ChangePasswordFormValues = z.infer<typeof formSchema>;

const ChangePasswordFormModal: React.FC<ChangePasswordFormModalProps> = ({ isOpen, onClose }) => {
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    },
  });

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
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
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
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
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
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
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