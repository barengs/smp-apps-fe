import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">{t('loginFormTitle')}</CardTitle>
          <CardDescription>
            {t('loginFormDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
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
                  className="pr-10" // Add padding-right to make space for the icon
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
            <Button type="submit" className="w-full">
              {t('loginButton')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;