import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Users, Book, Calendar, Settings, LayoutDashboard, Menu, User, BookOpenText, LogOut, Sun, Moon, Briefcase, Key, UsersRound } from 'lucide-react'; // Import Briefcase, Key, UsersRound icons
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes'; // Import useTheme hook
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'; // Import Accordion components

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

interface SidebarNavItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  children?: {
    title: string;
    href: string;
  }[];
}

// Sidebar component (moved inside DashboardLayout for consolidation)
const Sidebar: React.FC = () => {
  const location = useLocation();

  const sidebarNavItems: SidebarNavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
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
        },
        {
          title: "Hak Akses",
          href: "/dashboard/hak-akses",
        },
        {
          title: "Peran",
          href: "/dashboard/peran",
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

  return (
    <nav className={cn("flex flex-col p-4 space-y-2 h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border")}>
      <div className="flex items-center justify-center py-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center">
          <BookOpenText className="h-10 w-10 mr-2 text-sidebar-primary-foreground" />
          <span className="text-2xl font-bold text-sidebar-primary-foreground">SMP</span>
        </Link>
      </div>
      <div className="flex-grow pt-4">
        <Accordion type="single" collapsible className="w-full">
          {sidebarNavItems.map((item) => (
            item.children ? (
              <AccordionItem value={item.title} key={item.title}>
                <AccordionTrigger 
                  className={cn(
                    "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    item.children.some(child => location.pathname.startsWith(child.href))
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
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
                        "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
                        location.pathname.startsWith(child.href)
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      {child.title}
                    </Link>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ) : (
              <Link
                key={item.href}
                to={item.href || "#"}
                className={cn(
                  "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname.startsWith(item.href || "")
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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

// DashboardHeader component (moved inside DashboardLayout for consolidation)
const DashboardHeader: React.FC<{ title: string }> = ({ title }) => {
  const isMobile = useIsMobile();
  const { setTheme } = useTheme(); // Use useTheme hook

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
              <Sidebar />
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
        {/* Theme Toggle Dropdown */}
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

        {/* User Profile Dropdown */}
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

// Footer component (reused from MadeWithDyad and basic footer structure)
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


const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {!isMobile && (
        <aside className="w-64 flex-shrink-0">
          <Sidebar />
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