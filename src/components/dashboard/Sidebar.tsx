import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Users, Book, Calendar, Settings, LayoutDashboard } from 'lucide-react';

interface SidebarProps {
  className?: string;
}

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

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const location = useLocation();

  return (
    <nav className={cn("flex flex-col p-4 space-y-2 h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border", className)}>
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