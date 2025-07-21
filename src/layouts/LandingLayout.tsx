import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe, BookOpenText } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';

interface LandingLayoutProps {
  children: React.ReactNode;
  title: string;
}

const LandingLayout: React.FC<LandingLayoutProps> = ({ children, title }) => {
  useEffect(() => {
    document.title = `SMP | ${title}`;
  }, [title]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center">
          <BookOpenText className="h-10 w-10 mr-4 text-primary" />
          <span className="text-2xl font-bold text-primary">SMP</span>
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
              <DropdownMenuItem>العربية</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-20"> {/* Added pt-20 to account for fixed header */}
        {children}
      </main>

      {/* Footer */}
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
    </div>
  );
};

export default LandingLayout;