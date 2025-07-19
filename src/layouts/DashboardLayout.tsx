import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Users, Book, Calendar, Settings, LayoutDashboard, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { MadeWithDyad } from '@/components/made-with-dyad';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

// Sidebar component (moved inside DashboardLayout for consolidation)
const Sidebar: React.FC = () => {
  const location = useLocation();

  const sidebarNavItems = [
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
          <img src="/placeholder-logo.png" alt="Pesantren Logo" className="h-10 mr-2" />
          <span className="text-2xl font-bold text-sidebar-primary-foreground">Pesantren App</span>
        </Link>
      </div>
      <div className="flex-grow pt-4">
        {sidebarNavItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
              location.pathname.startsWith(item.href)
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            {item.icon}
            <span className="ml-3">{item.title}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

// DashboardHeader component (moved inside DashboardLayout for consolidation)
const DashboardHeader: React.FC<{ title: string }> = ({ title }) => {
  const isMobile = useIsMobile();

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
          <img src="/placeholder-logo.png" alt="Pesantren Logo" className="h-8 mr-2" />
          <span className="text-xl font-bold text-primary hidden sm:block">Pesantren App</span>
        </Link>
        <h1 className="text-2xl font-semibold ml-6 hidden md:block">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src="/avatar-placeholder.png" alt="User Avatar" />
          <AvatarFallback><User /></AvatarFallback>
        </Avatar>
        <span className="font-medium hidden sm:block">Nama Pengguna</span>
      </div>
    </header>
  );
};

// Footer component (reused from MadeWithDyad and basic footer structure)
const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 px-6 text-center">
      <div className="container mx-auto">
        <p className="text-lg mb-4">
          &copy; {new Date().getFullYear()} Pesantren Digital. All rights reserved.
        </p>
        <p className="text-sm text-gray-400">
          Jl. Contoh No. 123, Kota Santri, Provinsi Damai
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