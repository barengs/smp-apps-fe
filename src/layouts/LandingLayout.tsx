import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

interface LandingLayoutProps {
  children: React.ReactNode;
  title: string;
}

const LandingLayout: React.FC<LandingLayoutProps> = ({ children, title }) => {
  const { t, i18n } = useTranslation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApi] = useLogoutMutation();

  useEffect(() => {
    document.title = `SMP | ${title}`;
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.dir(i18n.language);
  }, [title, i18n, i18n.language]);

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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center">
          <BookOpenText className="h-10 w-10 mr-4 text-primary" />
          <span className="text-2xl font-bold text-primary">SMP</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link to="/" className="text-gray-700 hover:text-primary font-medium">{t('home')}</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard/administrasi" className="text-gray-700 hover:text-primary font-medium">{t('dashboard')}</Link>
              <Button variant="ghost" onClick={handleLogout} className="text-gray-700 hover:text-primary font-medium p-0 h-auto">
                {t('logout')}
              </Button>
            </>
          ) : (
            <>
              <Link key={`register-link-${i18n.language}`} to="/daftar" className="text-gray-700 hover:text-primary font-medium">{t('register')}</Link>
              <Link to="/login" className="text-gray-700 hover:text-primary font-medium">{t('login')}</Link>
            </>
          )}
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
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-20">
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