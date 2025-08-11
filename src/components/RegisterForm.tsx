import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';

const RegisterForm: React.FC = () => {
  const { t, i18n } = useTranslation(); // Dapatkan instance i18n
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Tentukan apakah arah bahasa adalah RTL
  const isRTL = i18n.dir() === 'rtl';

  // Kelas kondisional untuk kolom formulir
  const formColumnClasses = isRTL ? 'pl-8 md:border-l md:border-gray-200' : 'pr-8 md:border-r md:border-gray-200';
  // Kelas kondisional untuk kolom informasi
  const infoColumnClasses = isRTL ? 'pr-8 pt-8 md:pt-0' : 'pl-8 pt-8 md:pt-0';

  // Komponen formulir
  const formContent = (
    <div className={formColumnClasses}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">{t('fullNameLabel')}</Label>
          <Input id="name" type="text" placeholder={t('fullNamePlaceholder')} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">{t('emailLabel')}</Label>
          <Input id="email" type="email" placeholder={t('emailPlaceholder')} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">{t('passwordLabel')}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              className="pr-10"
            />
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
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirm-password">{t('confirmPasswordLabel')}</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              required
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={toggleConfirmPasswordVisibility}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="w-full">
            {t('registerButton')}
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/')}>
            {t('cancelButton')}
          </Button>
        </div>
      </div>
      <div className="mt-4 text-center text-sm">
        {t('alreadyHaveAccount')}{' '}
        <Link to="/login" className="underline">
          {t('loginLinkText')}
        </Link>
      </div>
    </div>
  );

  // Komponen informasi tata cara
  const infoContent = (
    <div className={infoColumnClasses}>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {t('registrationProcessTitle', 'Tata Cara Pendaftaran Santri Baru')}
      </h2>
      <p className="mb-4 text-gray-700">
        <span className="font-semibold">{t('step1Title', 'Langkah 1:')}</span>{' '}
        {t('step1Description', 'Wali santri membuat akun terlebih dahulu melalui formulir di samping.')}
      </p>
      <p className="mb-4 text-gray-700">
        <span className="font-semibold">{t('step2Title', 'Langkah 2:')}</span>{' '}
        {t('step2Description', 'Setelah berhasil mendaftar, wali santri dapat login untuk melengkapi profil pribadi.')}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">{t('step3Title', 'Langkah 3:')}</span>{' '}
        {t('step3Description', 'Kemudian, wali santri dapat mendaftarkan anak atau calon santri melalui dashboard yang tersedia.')}
      </p>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
      <Card className="w-full max-w-4xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">{t('registerFormTitle')}</CardTitle>
          <CardDescription>
            {t('registerFormDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {isRTL ? (
              <>
                {infoContent}
                {formContent}
              </>
            ) : (
              <>
                {formContent}
                {infoContent}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterForm;