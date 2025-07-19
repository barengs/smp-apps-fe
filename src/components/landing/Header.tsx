import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center">
        {/* Placeholder for Logo */}
        <img src="/placeholder-logo.png" alt="Pesantren Logo" className="h-10 mr-4" />
        <span className="text-2xl font-bold text-primary">Pesantren App</span>
      </div>
      <nav className="flex items-center space-x-6">
        <Link to="/" className="text-gray-700 hover:text-primary font-medium">Home</Link>
        <Link to="/daftar" className="text-gray-700 hover:text-primary font-medium">Daftar</Link>
        <Link to="/login" className="text-gray-700 hover:text-primary font-medium">Login</Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Globe className="h-5 w-5" />
              <span className="sr-only">Pilih Bahasa</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Bahasa Indonesia</DropdownMenuItem>
            <DropdownMenuItem>English</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  );
};

export default Header;