import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLoginMutation, LoginRequest } from '@/store/slices/authApi';
import * as toast from '@/utils/toast';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const formSchema = z.object({
  login: z.string().min(1, { message: 'Bidang login tidak boleh kosong.' }),
  password: z.string().min(1, { message: 'Kata sandi tidak boleh kosong.' }),
});

type FormValues = z.infer<typeof formSchema>;

const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [loginMutation, { isLoading }] = useLoginMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      login: '',
      password: '',
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const loginResult = await loginMutation(values as LoginRequest).unwrap();
      toast.showSuccess('Login berhasil!');

      const loggedInUser = loginResult.user;
      const roles = loggedInUser?.roles?.map((r: any) => r.name) || [];

      if (roles.includes('orangtua')) {
        navigate('/dashboard/wali-santri');
      } else if (roles.some((r: string) => r.toLowerCase().includes('bank') || r.toLowerCase().includes('kasir'))) {
        // Optimization: Redirect DIRECTLY to Bank Santri Web URL
        // This eliminates the 30-second delay from the intermediate backend hop
        setIsRedirecting(true);
        const bankWebUrl = 'http://localhost:8001'; // Target Bank Santri web base
        const ssoUrl = `${bankWebUrl}/auth/sso?token=${loginResult.access_token}`;
        
        // Short delay to allow the "Redirecting" UI to be seen
        setTimeout(() => {
          window.location.href = ssoUrl;
        }, 800);
      } else {
        navigate('/dashboard/administrasi');
      }

    } catch (err) {
      const error = err as FetchBaseQueryError;
      let errorMessage = 'Login gagal. Periksa kembali kredensial Anda.';
      if (error && typeof error.data === 'object' && error.data && 'message' in error.data) {
        errorMessage = (error.data as { message: string }).message;
      }
      toast.showError(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">{t('loginFormTitle')}</CardTitle>
          <CardDescription>{t('loginFormDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="login"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel htmlFor="login">{t('emailLabel')}</FormLabel>
                    <FormControl>
                      <Input id="login" type="text" placeholder={t('emailPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel htmlFor="password">{t('passwordLabel')}</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          className="pr-10"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
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
              <div className="flex gap-2">
                <Button type="submit" variant="success" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Memproses...' : t('loginButton')}
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/')}>
                  {t('cancelButton')}
                </Button>
              </div>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            {t('noAccountYet')}{' '}
            <Link to="/daftar" className="underline">
              {t('registerLinkText')}
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Redirection Overlay */}
      {isRedirecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-300">
          <div className="flex flex-col items-center p-8 bg-white rounded-lg shadow-2xl border border-blue-50 max-w-xs w-full animate-in zoom-in-95 duration-200">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-20"></div>
              <div className="relative p-4 rounded-full bg-blue-50 border border-blue-100">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Menyiapkan Akses</h3>
            <p className="text-center text-slate-500 text-sm leading-relaxed">
              Sedang mengalihkan Anda ke <span className="font-semibold text-blue-600">Dashboard Bank Santri</span>...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;