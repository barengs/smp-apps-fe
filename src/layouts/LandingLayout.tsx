import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe, BookOpenText } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { useLogoutMutation } from '@/store/slices/authApi';
import { logOut } from '@/store/authActions';
import * as toast from '@/utils/toast';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { useGetControlPanelSettingsQuery } from '@/store/slices/controlPanelApi';

interface LandingLayoutProps {
  children: React.ReactNode;
  title: string;
}

const LandingLayout: React.FC<LandingLayoutProps> = ({ children, title }) => {
  const { t, i18n } = useTranslation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutApi] = useLogoutMutation();
  const { data: settingsResponse } = useGetControlPanelSettingsQuery(); // Mengubah nama variabel
  const settings = settingsResponse?.data; // Mengakses data dari properti 'data'

  useEffect(() => {
    document.title = `${settings?.app_name || 'SMP'} | ${title}`;
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.dir(i18n.language);
  }, [title, i18n, i18n.language, settings]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(logOut());
      toast.showSuccess('Anda telah berhasil logout.');
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
      toast.showError('Gagal logout. Silakan coba lagi.');
    }
  };

  const navItems = [
    { href: '/', labelKey: 'home' },
    ...(isAuthenticated
      ? [{ href: '/dashboard/administrasi', labelKey: 'dashboard' }]
      : [
          { href: '/daftar', labelKey: 'register' },
          { href: '/login', labelKey: 'login' },
        ]),
  ];

  const defaultLogoPath = "/images/default-logo.png"; // Path to your default logo

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm py-2 px-6 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center">
          {settings?.app_logo ? (
            <img src={`https://api.smp.barengsaya.com/storage/uploads/logos/small/${settings.app_logo}`} alt="App Logo" className="h-10 w-10 mr-4 object-contain" />
          ) : (
            <img src={defaultLogoPath} alt="Default App Logo" className="h-10 w-10 mr-4 object-contain" />
          )}
          <span className="text-2xl font-bold text-primary">{settings?.app_name || 'SMP'}</span>
        </div>
        <div className="flex items-center gap-2">
          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      'bg-transparent',
                      location.pathname === item.href
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    )}
                  >
                    {t(item.labelKey)}
                  </Link>
                </NavigationMenuItem>
              ))}
              {isAuthenticated && (
                <NavigationMenuItem>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className={cn(navigationMenuTriggerStyle(), 'bg-transparent hover:bg-accent/50')}
                  >
                    {t('logout')}
                  </Button>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
                <span className="sr-only">{t('chooseLanguage')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLanguage('id')}>
                <span className="mr-2">🇮🇩</span> {t('indonesian')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('en')}>
                <span className="mr-2">🇬🇧</span> {t('english')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('ar')}>
                <span className="mr-2">🇸🇦</span> {t('arabic')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-14">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-6 text-center">
        <div className="container mx-auto">
          <p className="text-lg mb-4">
            &copy; {new Date().getFullYear()} {t('footerRights')}
          </p>
          <p className="text-sm text-gray-400">
            Jl. Contoh No. 123, Kota Santri, Provinsi Damai
          </p>
          <MadeWithDyad />
        </div>
      </footer>
    </div>
  );
};

export default LandingLayout;