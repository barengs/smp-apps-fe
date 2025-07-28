import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Users, Calendar, Settings, LayoutDashboard, Menu, User, BookOpenText, LogOut, Sun, Moon, Briefcase, Key, UsersRound, UserCog, Megaphone, UserCheck, UserPlus, Maximize, Minimize, ChevronsLeft, ChevronsRight, Map, Landmark, Building2, Tent, GraduationCap, Network, School, BedDouble, ClipboardList, Globe, BookCopy, TrendingUp, CalendarClock, Shield, AlertTriangle, BookMarked, Compass, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/theme-provider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useLogoutMutation } from '@/store/slices/authApi';
import { logOut } from '@/store/slices/authSlice';
import * as toast from '@/utils/toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  role: 'wali-santri' | 'administrasi';
}

interface SidebarNavItem {
  titleKey: string;
  href?: string;
  icon: React.ReactNode;
  children?: {
    titleKey: string;
    href: string;
    icon?: React.ReactNode;
  }[];
}

interface SidebarProps {
  role: 'wali-santri' | 'administrasi';
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ role, isCollapsed }) => {
  const location = useLocation();
  const { t } = useTranslation();

  const adminSidebarNavItems: SidebarNavItem[] = [
    { titleKey: "sidebar.dashboard", href: "/dashboard/administrasi", icon: <LayoutDashboard className="h-5 w-5" /> },
    {
      titleKey: "sidebar.santriManagement",
      icon: <Users className="h-5 w-5" />,
      children: [
        { titleKey: "sidebar.santri", href: "/dashboard/santri", icon: <UserCheck className="h-4 w-4" /> },
        { titleKey: "sidebar.registration", href: "/dashboard/pendaftaran-santri", icon: <UserPlus className="h-4 w-4" /> },
        { titleKey: "sidebar.waliSantri", href: "/dashboard/wali-santri-list", icon: <UserPlus className="h-4 w-4" /> },
        { titleKey: "sidebar.teacherAssignment", href: "/dashboard/guru-tugas", icon: <User className="h-4 w-4" /> },
      ],
    },
    {
      titleKey: "sidebar.staffManagement",
      icon: <Briefcase className="h-5 w-5" />,
      children: [
        { titleKey: "sidebar.staff", href: "/dashboard/staf", icon: <UsersRound className="h-4 w-4" /> },
        { titleKey: "sidebar.accessRights", href: "/dashboard/hak-akses", icon: <Key className="h-4 w-4" /> },
        { titleKey: "sidebar.roles", href: "/dashboard/peran", icon: <UserCog className="h-4 w-4" /> },
      ],
    },
    {
      titleKey: "sidebar.curriculum",
      icon: <BookCopy className="h-5 w-5" />,
      children: [
        { titleKey: "sidebar.subjects", href: "/dashboard/manajemen-kurikulum/mata-pelajaran", icon: <BookMarked className="h-4 w-4" /> },
        { titleKey: "sidebar.classPromotion", href: "/dashboard/manajemen-kurikulum/kenaikan-kelas", icon: <TrendingUp className="h-4 w-4" /> },
        { titleKey: "sidebar.lessonSchedule", href: "/dashboard/manajemen-kurikulum/jadwal-pelajaran", icon: <CalendarClock className="h-4 w-4" /> },
      ],
    },
    {
      titleKey: "sidebar.securityManagement",
      icon: <Shield className="h-5 w-5" />,
      children: [
        { titleKey: "sidebar.violations", href: "/dashboard/manajemen-kamtib/pelanggaran", icon: <AlertTriangle className="h-4 w-4" /> },
      ],
    },
    {
      titleKey: "sidebar.educationManagement",
      icon: <GraduationCap className="h-5 w-5" />,
      children: [
        { titleKey: "sidebar.educationLevel", href: "/dashboard/pendidikan/jenjang", icon: <Network className="h-4 w-4" /> },
        { titleKey: "sidebar.class", href: "/dashboard/pendidikan/kelas", icon: <School className="h-4 w-4" /> },
        { titleKey: "sidebar.classGroup", href: "/dashboard/pendidikan/rombel", icon: <Users className="h-4 w-4" /> },
        { titleKey: "sidebar.educationGroup", href: "/dashboard/pendidikan/kelompok-pendidikan", icon: <Compass className="h-4 w-4" /> },
        { titleKey: "sidebar.dormitory", href: "/dashboard/pendidikan/asrama", icon: <BedDouble className="h-4 w-4" /> },
        { titleKey: "sidebar.program", href: "/dashboard/pendidikan/program", icon: <ClipboardList className="h-4 w-4" /> },
      ],
    },
    {
      titleKey: "sidebar.information",
      icon: <Megaphone className="h-5 w-5" />,
      children: [
        { titleKey: "sidebar.news", href: "/dashboard/berita", icon: <Newspaper className="h-4 w-4" /> },
        { titleKey: "sidebar.activitySchedule", href: "/dashboard/jadwal", icon: <Calendar className="h-4 w-4" /> },
      ],
    },
    {
      titleKey: "sidebar.masterData",
      icon: <ClipboardList className="h-5 w-5" />,
      children: [
        { titleKey: "sidebar.job", href: "/dashboard/master-data/pekerjaan", icon: <Briefcase className="h-4 w-4" /> },
        { titleKey: "sidebar.province", href: "/dashboard/wilayah/provinsi", icon: <Map className="h-4 w-4" /> },
        { titleKey: "sidebar.city", href: "/dashboard/wilayah/kota", icon: <Building2 className="h-4 w-4" /> },
        { titleKey: "sidebar.district", href: "/dashboard/wilayah/kecamatan", icon: <Tent className="h-4 w-4" /> },
        { titleKey: "sidebar.village", href: "/dashboard/wilayah/desa", icon: <Home className="h-4 w-4" /> },
      ],
    },
    {
      titleKey: "sidebar.settings",
      icon: <Settings className="h-5 w-5" />,
      children: [
        { titleKey: "sidebar.system", href: "/dashboard/settings/system", icon: <Settings className="h-4 w-4" /> },
        { titleKey: "sidebar.navigation", href: "/dashboard/settings/navigation", icon: <Compass className="h-4 w-4" /> },
      ],
    },
  ];

  const waliSantriSidebarNavItems: SidebarNavItem[] = [
    { titleKey: "sidebar.dashboard", href: "/dashboard/wali-santri", icon: <LayoutDashboard className="h-5 w-5" /> },
    { titleKey: "sidebar.santriInfo", href: "/dashboard/informasi-santri", icon: <User className="h-5 w-5" /> },
    { titleKey: "sidebar.gradesAndAttendance", href: "/dashboard/nilai-absensi", icon: <BookOpenText className="h-5 w-5" /> },
    { titleKey: "sidebar.bankSantri", href: "/dashboard/bank-santri", icon: <Landmark className="h-5 w-5" /> },
    { titleKey: "sidebar.announcements", href: "/dashboard/pengumuman", icon: <Megaphone className="h-5 w-5" /> },
    { titleKey: "sidebar.settings", href: "/dashboard/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  const sidebarNavItems = role === 'administrasi' ? adminSidebarNavItems : waliSantriSidebarNavItems;

  const defaultOpenItem = React.useMemo(() => {
    if (isCollapsed) return undefined;
    for (const item of sidebarNavItems) {
      if (item.children?.some(child => location.pathname.startsWith(child.href))) {
        return item.titleKey;
      }
    }
    return undefined;
  }, [location.pathname, sidebarNavItems, isCollapsed]);

  return (
    <nav className={cn("flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border")}>
      <div className={cn(
        "flex items-center h-16 shrink-0 border-b border-sidebar-border px-4",
        isCollapsed ? "justify-center" : "justify-start"
      )}>
        <Link to="/" className="flex items-center gap-2 overflow-hidden">
          <BookOpenText className="h-8 w-8 text-primary shrink-0" />
          {!isCollapsed && (
            <span className="text-xl font-bold text-primary whitespace-nowrap">SMP</span>
          )}
        </Link>
      </div>
      <div className="flex-grow p-2 pt-4 space-y-1 overflow-y-auto">
        <Accordion type="single" collapsible className="w-full space-y-1" defaultValue={defaultOpenItem} key={isCollapsed ? 'collapsed' : 'expanded'}>
          {sidebarNavItems.map((item) => {
            const isActive = item.children?.some(c => location.pathname.startsWith(c.href)) ?? location.pathname.startsWith(item.href ?? '___');

            if (item.children) {
              if (isCollapsed) {
                return (
                  <DropdownMenu key={item.titleKey}>
                    <DropdownMenuTrigger asChild>
                      {/* Tooltip wraps its trigger and content */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg p-0"
                            size="icon"
                          >
                            {item.icon}
                            <span className="sr-only">{t(item.titleKey)}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">{t(item.titleKey)}</TooltipContent>
                      </Tooltip>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {item.children.map((child) => (
                        <DropdownMenuItem key={child.href} asChild>
                          <Link to={child.href}>
                            {child.icon}
                            <span className="ml-3">{t(child.titleKey)}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              } else {
                return (
                  <AccordionItem value={item.titleKey} key={item.titleKey} className="border-none">
                    <AccordionTrigger
                      className={cn(
                        "flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-sidebar-accent/80 hover:no-underline",
                        isActive && "bg-sidebar-primary text-sidebar-primary-foreground"
                      )}
                    >
                      <div className="flex items-center flex-grow">
                        {item.icon}
                        <span className="ml-3">{t(item.titleKey)}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-6 pt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className={cn(
                            "flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-md",
                            location.pathname.startsWith(child.href)
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : "hover:bg-sidebar-accent/80"
                          )}
                        >
                          {child.icon}
                          <span className="ml-3">{t(child.titleKey)}</span>
                        </Link>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                );
              }
            } else {
              if (isCollapsed) {
                return (
                  <Tooltip key={item.titleKey}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.href || "#"}
                        className={cn(
                          "flex items-center py-2 text-sm font-medium transition-colors rounded-md",
                          isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent/80",
                          "justify-center"
                        )}
                      >
                        {item.icon}
                        <span className="sr-only">{t(item.titleKey)}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{t(item.titleKey)}</TooltipContent>
                  </Tooltip>
                );
              } else {
                return (
                  <Link
                    key={item.titleKey}
                    to={item.href || "#"}
                    className={cn(
                      "flex items-center py-2 text-sm font-medium transition-colors rounded-md",
                      isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent/80",
                      "px-4"
                    )}
                  >
                    {item.icon}
                    <span className="ml-3">{t(item.titleKey)}</span>
                  </Link>
                );
              }
            }
          })}
        </Accordion>
      </div>
    </nav>
  );
};

const DashboardHeader: React.FC<{ title: string; role: 'wali-santri' | 'administrasi'; isMobile: boolean; isCollapsed: boolean; setIsCollapsed: (collapsed: boolean) => void; }> = ({ title, role, isMobile, isCollapsed, setIsCollapsed }) => {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hijriDate, setHijriDate] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApi] = useLogoutMutation();

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const today = new Date();
    const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const parts = formatter.formatToParts(today);
    let year = '';
    let month = '';
    let day = '';
    for (const part of parts) {
      if (part.type === 'year') year = part.value;
      if (part.type === 'month') month = part.value;
      if (part.type === 'day') day = part.value;
    }
    setHijriDate(`${day}, ${month}, ${year}`);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen();
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

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
    <header className="bg-white dark:bg-gray-900 shadow-sm h-16 px-6 flex justify-between items-center border-b border-border">
      <div className="flex items-center">
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-4">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar role={role} isCollapsed={false} />
            </SheetContent>
          </Sheet>
        ) : (
          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="ghost"
            size="icon"
            className="mr-4"
          >
            {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </Button>
        )}
        <div className="hidden md:block">
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-muted-foreground hidden sm:block">{hijriDate}</span>
        <Button variant="ghost" size="icon" onClick={toggleFullScreen}>
          {isFullscreen ? <Minimize className="h-[1.2rem] w-[1.2rem]" /> : <Maximize className="h-[1.2rem] w-[1.2rem]" />}
          <span className="sr-only">{t('header.toggleFullscreen')}</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t('header.toggleTheme')}</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Globe className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">{t('header.selectLanguage')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => changeLanguage('id')}>
              <span className="mr-2">🇮🇩</span> Bahasa Indonesia
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => changeLanguage('en')}>
              <span className="mr-2">🇬🇧</span> English
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => changeLanguage('ar')}>
              <span className="mr-2">🇸🇦</span> العربية
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar><AvatarImage src="/avatar-placeholder.png" alt="User Avatar" /><AvatarFallback><User /></AvatarFallback></Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem><Settings className="mr-2 h-4 w-4" /><span>{t('header.settings')}</span></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout}><LogOut className="mr-2 h-4 w-4" /><span>{t('header.logout')}</span></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="font-medium hidden sm:block">{t('header.usernamePlaceholder')}</span>
      </div>
    </header>
  );
};

const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-800 text-white py-1 px-6 text-center">
      <div className="container mx-auto flex flex-col sm:flex-row justify-center items-center text-xs">
        <p className="mb-1 sm:mb-0 sm:mr-2">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        <MadeWithDyad />
      </div>
    </footer>
  );
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, role }) => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    document.title = `SMP | ${title}`;
  }, [title]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-background">
      {!isMobile && (
        <aside className={cn("flex-shrink-0 transition-all duration-300 ease-in-out", isCollapsed ? "w-20" : "w-64")}>
          <TooltipProvider delayDuration={0}>
            <Sidebar role={role} isCollapsed={isCollapsed} />
          </TooltipProvider>
        </aside>
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader title={title} role={role} isMobile={isMobile} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;