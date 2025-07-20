import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Users, Book, Calendar, Settings, LayoutDashboard, Menu, User, BookOpenText, LogOut, Sun, Moon, Briefcase, Key, UsersRound, UserCog, Megaphone, UserCheck, UserPlus, Maximize, Minimize, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  role: 'wali-santri' | 'administrasi';
}

interface SidebarNavItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  children?: {
    title: string;
    href: string;
    icon?: React.ReactNode;
  }[];
}

interface SidebarProps {
  role: 'wali-santri' | 'administrasi';
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, isCollapsed, setIsCollapsed }) => {
  const location = useLocation();

  const adminSidebarNavItems: SidebarNavItem[] = [
    { title: "Dashboard", href: "/dashboard/administrasi", icon: <LayoutDashboard className="h-5 w-5" /> },
    {
      title: "Manajemen Santri",
      icon: <Users className="h-5 w-5" />,
      children: [
        { title: "Santri", href: "/dashboard/santri", icon: <UserCheck className="h-4 w-4" /> },
        { title: "Wali Santri", href: "/dashboard/wali-santri-list", icon: <UserPlus className="h-4 w-4" /> },
      ],
    },
    {
      title: "Manajemen Staf",
      icon: <Briefcase className="h-5 w-5" />,
      children: [
        { title: "Staf", href: "/dashboard/staf", icon: <UsersRound className="h-4 w-4" /> },
        { title: "Hak Akses", href: "/dashboard/hak-akses", icon: <Key className="h-4 w-4" /> },
        { title: "Peran", href: "/dashboard/peran", icon: <UserCog className="h-4 w-4" /> },
      ],
    },
    { title: "Manajemen Pelajaran", href: "/dashboard/pelajaran", icon: <Book className="h-5 w-5" /> },
    { title: "Jadwal Kegiatan", href: "/dashboard/jadwal", icon: <Calendar className="h-5 w-5" /> },
    { title: "Pengaturan", href: "/dashboard/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  const waliSantriSidebarNavItems: SidebarNavItem[] = [
    { title: "Dashboard", href: "/dashboard/wali-santri", icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: "Informasi Santri", href: "/dashboard/informasi-santri", icon: <User className="h-5 w-5" /> },
    { title: "Nilai & Absensi", href: "/dashboard/nilai-absensi", icon: <BookOpenText className="h-5 w-5" /> },
    { title: "Pengumuman", href: "/dashboard/pengumuman", icon: <Megaphone className="h-5 w-5" /> },
    { title: "Pengaturan", href: "/dashboard/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  const sidebarNavItems = role === 'administrasi' ? adminSidebarNavItems : waliSantriSidebarNavItems;

  const defaultOpenItem = React.useMemo(() => {
    if (isCollapsed) return undefined;
    for (const item of sidebarNavItems) {
      if (item.children?.some(child => location.pathname.startsWith(child.href))) {
        return item.title;
      }
    }
    return undefined;
  }, [location.pathname, sidebarNavItems, isCollapsed]);

  const NavItemLink: React.FC<{ item: SidebarNavItem }> = ({ item }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={item.href || "#"}
          className={cn(
            "flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-md",
            location.pathname.startsWith(item.href || "___")
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "hover:bg-sidebar-accent/80",
            isCollapsed && "justify-center"
          )}
        >
          {item.icon}
          {!isCollapsed && <span className="ml-3">{item.title}</span>}
        </Link>
      </TooltipTrigger>
      {isCollapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
    </Tooltip>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <nav className={cn("flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border")}>
        <div className={cn("flex items-center py-4 border-b border-sidebar-border", isCollapsed ? "justify-center" : "px-4 justify-between")}>
          <Link to="/" className="flex items-center">
            <BookOpenText className={cn("h-10 w-10 text-sidebar-primary-foreground transition-all", !isCollapsed && "mr-2")} />
            {!isCollapsed && <span className="text-2xl font-bold text-sidebar-primary-foreground">SMP</span>}
          </Link>
        </div>
        <div className="flex-grow p-2 pt-4 space-y-1">
          <Accordion type="single" collapsible className="w-full space-y-1" defaultValue={defaultOpenItem} key={defaultOpenItem}>
            {sidebarNavItems.map((item) =>
              item.children ? (
                <AccordionItem value={item.title} key={item.title} className="border-none">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AccordionTrigger
                        disabled={isCollapsed}
                        className={cn(
                          "flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-sidebar-accent/80 hover:no-underline",
                          item.children.some(c => location.pathname.startsWith(c.href)) && "bg-sidebar-accent text-sidebar-accent-foreground",
                          isCollapsed && "justify-center"
                        )}
                      >
                        {item.icon}
                        {!isCollapsed && <span className="ml-3 flex-grow text-left">{item.title}</span>}
                      </AccordionTrigger>
                    </TooltipTrigger>
                    {isCollapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
                  </Tooltip>
                  <AccordionContent className="pl-6 pt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        className={cn(
                          "flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-md",
                          location.pathname.startsWith(child.href)
                            ? "bg-sidebar-accent/50 text-sidebar-accent-foreground"
                            : "hover:bg-sidebar-accent/80"
                        )}
                      >
                        {child.icon}
                        <span className="ml-3">{child.title}</span>
                      </Link>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <NavItemLink item={item} key={item.title} />
              )
            )}
          </Accordion>
        </div>
        <div className="mt-auto p-4 border-t border-sidebar-border">
          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="ghost"
            className="w-full"
          >
            {!isCollapsed && <span className="mr-2">Ciutkan</span>}
            {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </Button>
        </div>
      </nav>
    </TooltipProvider>
  );
};

const DashboardHeader: React.FC<{ title: string; role: 'wali-santri' | 'administrasi'; isMobile: boolean; }> = ({ title, role, isMobile }) => {
  const { setTheme } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm py-4 px-6 flex justify-between items-center fixed top-0 left-0 right-0 z-50 border-b border-border">
      <div className="flex items-center">
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-4">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar role={role} isCollapsed={false} setIsCollapsed={() => {}} />
            </SheetContent>
          </Sheet>
        )}
        <h1 className="text-2xl font-semibold hidden md:block">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={toggleFullScreen}>
          {isFullscreen ? <Minimize className="h-[1.2rem] w-[1.2rem]" /> : <Maximize className="h-[1.2rem] w-[1.2rem]" />}
          <span className="sr-only">Toggle Fullscreen</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar><AvatarImage src="/avatar-placeholder.png" alt="User Avatar" /><AvatarFallback><User /></AvatarFallback></Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem><User className="mr-2 h-4 w-4" /><span>Profil</span></DropdownMenuItem>
            <DropdownMenuItem><Settings className="mr-2 h-4 w-4" /><span>Pengaturan</span></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem><LogOut className="mr-2 h-4 w-4" /><span>Keluar</span></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="font-medium hidden sm:block">Nama Pengguna</span>
      </div>
    </header>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-gray-800 text-white py-1 px-6 text-center">
    <div className="container mx-auto flex flex-col sm:flex-row justify-center items-center text-xs">
      <p className="mb-1 sm:mb-0 sm:mr-2">&copy; {new Date().getFullYear()} Pesantren Digital. All rights reserved.</p>
      <MadeWithDyad />
    </div>
  </footer>
);

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, role }) => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background">
      {!isMobile && (
        <aside className={cn("flex-shrink-0 transition-all duration-300 ease-in-out", isCollapsed ? "w-20" : "w-64")}>
          <Sidebar role={role} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        </aside>
      )}
      <div className="flex flex-col flex-grow">
        <DashboardHeader title={title} role={role} isMobile={isMobile} />
        <main className="flex-grow p-4 mt-20">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;