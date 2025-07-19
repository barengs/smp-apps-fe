import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Users, Book, Calendar, Settings, LayoutDashboard, Menu, User, BookOpenText, LogOut, Sun, Moon, Briefcase, Key, UsersRound, UserCog, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  role: 'wali-santri' | 'administrasi'; // Menambahkan properti role
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

const Sidebar: React.FC<{ role: 'wali-santri' | 'administrasi' }> = ({ role }) => {
  const location = useLocation();

  const adminSidebarNavItems: SidebarNavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard/administrasi", // Mengarahkan ke dashboard administrasi
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Manajemen Santri",
      href: "/dashboard/santri",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Manajemen Staf",
      icon: <Briefcase className="h-5 w-5" />,
      children: [
        {
          title: "Staf",
          href: "/dashboard/staf",
          icon: <UsersRound className="h-4 w-4" />,
        },
        {
          title: "Hak Akses",
          href: "/dashboard/hak-akses",
          icon: <Key className="h-4 w-4" />,
        },
        {
          title: "Peran",
          href: "/dashboard/peran",
          icon: <UserCog className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Manajemen Pelajaran",
      href: "/dashboard/pelajaran",
      icon: <Book className="h-5 w-5" />,
    },
    {
      title: "Jadwal Kegiatan",
      href: "/dashboard/jadwal",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: "Pengaturan",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const waliSantriSidebarNavItems: SidebarNavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard/wali-santri", // Mengarahkan ke dashboard wali santri
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Informasi Santri",
      href: "/dashboard/informasi-santri", // Contoh rute untuk informasi santri
      icon: <User className="h-5 w-5" />,
    },
    {
      title: "Nilai & Absensi",
      href: "/dashboard/nilai-absensi", // Contoh rute untuk nilai & absensi
      icon: <BookOpenText className="h-5 w-5" />,
    },
    {
      title: "Pengumuman",
      href: "/dashboard/pengumuman", // Contoh rute untuk pengumuman
      icon: <Megaphone className="h-5 w-5" />,
    },
    {
      title: "Pengaturan",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const sidebarNavItems = role === 'administrasi' ? adminSidebarNavItems : waliSantriSidebarNavItems;

  // Determine which accordion item should be open by default
  const defaultOpenItem = React.useMemo(() => {
    for (const item of sidebarNavItems) {
      if (item.children) {
        if (item.children.some(child => location.pathname.startsWith(child.href))) {
          return item.title;
        }
      }
    }
    return undefined;
  }, [location.pathname, sidebarNavItems]);

  return (
    <nav className={cn("flex flex-col p-4 space-y-2 h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border")}>
      <div className="flex items-center justify-center py-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center">
          <BookOpenText className="h-10 w-10 mr-2 text-sidebar-primary-foreground" />
          <span className="text-2xl font-bold text-sidebar-primary-foreground">SMP</span>
        </Link>
      </div>
      <div className="flex-grow pt-4">
        <Accordion type="single" collapsible className="w-full" defaultValue={defaultOpenItem}>
          {sidebarNavItems.map((item) => (
            item.children ? (
              <AccordionItem value={item.title} key={item.title}>
                <AccordionTrigger
                  className={cn(
                    "flex items-center px-4 py-2 text-sm font-medium transition-colors", // Removed rounded-md
                    "hover:bg-gray-100 dark:hover:bg-gray-700", // Flat gray hover
                    item.children.some(child => location.pathname.startsWith(child.href))
                      ? "bg-gray-200 dark:bg-gray-600 text-sidebar-primary-foreground" // Flat gray active
                      : ""
                  )}
                >
                  {item.icon}
                  <span className="ml-3 flex-grow text-left">{item.title}</span>
                </AccordionTrigger>
                <AccordionContent className="pl-8">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      to={child.href}
                      className={cn(
                        "flex items-center px-4 py-2 text-sm font-medium transition-colors", // Removed rounded-md
                        location.pathname.startsWith(child.href)
                          ? "bg-gray-200 dark:bg-gray-600 text-sidebar-primary-foreground" // Flat gray active
                          : "hover:bg-gray-100 dark:hover:bg-gray-700" // Flat gray hover
                      )}
                    >
                      {child.icon}
                      <span className="ml-3">{child.title}</span>
                    </Link>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ) : (
              <Link
                key={item.href}
                to={item.href || "#"}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium transition-colors", // Removed rounded-md
                  location.pathname.startsWith(item.href || "")
                    ? "bg-gray-200 dark:bg-gray-600 text-sidebar-primary-foreground" // Flat gray active
                    : "hover:bg-gray-100 dark:hover:bg-gray-700" // Flat gray hover
                )}
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </Link>
            )
          ))}
        </Accordion>
      </div>
    </nav>
  );
};

const DashboardHeader: React.FC<{ title: string }> = ({ title }) => {
  const isMobile = useIsMobile();
  const { setTheme } = useTheme();

  return (
    <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center fixed top-0 left-0 right-0 z-50 border-b border-border">
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
              <Sidebar role="administrasi" /> {/* Default role for mobile sidebar, will be overridden by specific page */}
            </SheetContent>
          </Sheet>
        )}
        <Link to="/" className="flex items-center">
          <BookOpenText className="h-8 w-8 mr-2 text-primary" />
          <span className="text-xl font-bold text-primary hidden sm:block">SMP</span>
        </Link>
        <h1 className="text-2xl font-semibold ml-6 hidden md:block">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar>
                <AvatarImage src="/avatar-placeholder.png" alt="User Avatar" />
                <AvatarFallback><User /></AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Pengaturan</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => console.log("Go Out clicked")}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Go Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="font-medium hidden sm:block">Nama Pengguna</span>
      </div>
    </header>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-2 px-6 text-center">
      <div className="container mx-auto flex flex-col sm:flex-row justify-center items-center text-xs">
        <p className="mb-1 sm:mb-0 sm:mr-2">
          &copy; {new Date().getFullYear()} Pesantren Digital. All rights reserved. Jl. Contoh No. 123, Kota Santri, Provinsi Damai.
        </p>
        <MadeWithDyad />
      </div>
    </footer>
  );
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, role }) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {!isMobile && (
        <aside className="w-64 flex-shrink-0">
          <Sidebar role={role} />
        </aside>
      )}
      <div className="flex flex-col flex-grow">
        <DashboardHeader title={title} />
        <main className="flex-grow p-6 mt-20">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;