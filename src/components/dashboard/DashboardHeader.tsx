import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sidebar } from './Sidebar'; // Import Sidebar for mobile menu

interface DashboardHeaderProps {
  title: string;
  onSidebarToggle?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title }) => {
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

export default DashboardHeader;