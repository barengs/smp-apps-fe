import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe, BookOpenText, Info } from 'lucide-react'; // Import Info icon
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import type { CarouselApi } from '@/components/ui/carousel'; // Import CarouselApi type

import { MadeWithDyad } from '@/components/made-with-dyad';

const LandingLayout: React.FC = () => {
  const infoSlides = [
    "Selamat datang di aplikasi manajemen pesantren kami!",
    "Memudahkan pendaftaran santri baru.",
    "Informasi kegiatan pesantren terkini.",
    "Akses nilai dan absensi santri.",
    "Komunikasi efektif antara wali dan administrasi.",
    "Fitur baru akan segera hadir!",
    "Dukungan penuh untuk pengguna.",
  ];

  const [api, setApi] = useState<CarouselApi>(); // State untuk menyimpan API carousel
  const autoplayInterval = 3000; // 3 detik

  useEffect(() => {
    if (!api) {
      return;
    }

    const timer = setInterval(() => {
      api.scrollNext();
    }, autoplayInterval);

    // Bersihkan interval saat komponen di-unmount atau API berubah
    return () => {
      clearInterval(timer);
    };
  }, [api, autoplayInterval]); // Dependensi pada api dan autoplayInterval

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
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </header>

      {/* Hero Section (Main Content) */}
      <main className="flex-grow">
        <section className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 pb-12">
          <div className="text-center mb-12">
            <BookOpenText className="h-48 w-48 mx-auto mb-8 text-primary" />
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
              Selamat Datang di Pesantren Digital
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Platform terpadu untuk mengelola dan memantau kegiatan pesantren dengan lebih mudah dan efisien.
            </p>
          </div>

          <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl">
            <div className="flex justify-center mb-2">
              <Info className="h-8 w-8 text-gray-700" /> {/* Ikon Info */}
            </div>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Informasi Singkat</h2>
            <Carousel className="w-full" setApi={setApi}> {/* Meneruskan setApi ke Carousel */}
              <CarouselContent className="-ml-4">
                {infoSlides.map((slide, index) => (
                  <CarouselItem key={index} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card>
                        <CardContent className="flex aspect-square items-center justify-center p-6 bg-blue-100 rounded-lg">
                          <span className="text-lg font-semibold text-blue-800 text-center">{slide}</span>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </section>
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