import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const HeroSection = () => {
  const infoSlides = [
    "Selamat datang di aplikasi manajemen pesantren kami!",
    "Memudahkan pendaftaran santri baru.",
    "Informasi kegiatan pesantren terkini.",
    "Akses nilai dan absensi santri.",
    "Komunikasi efektif antara wali dan administrasi.",
  ];

  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 pb-12">
      <div className="text-center mb-12">
        {/* Placeholder for Large Logo */}
        <img src="/large-pesantren-logo.png" alt="Large Pesantren Logo" className="h-48 mx-auto mb-8" />
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          Selamat Datang di Pesantren Digital
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Platform terpadu untuk mengelola dan memantau kegiatan pesantren dengan lebih mudah dan efisien.
        </p>
      </div>

      <div className="w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Informasi Singkat</h2>
        <Carousel className="w-full">
          <CarouselContent>
            {infoSlides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-video items-center justify-center p-6 bg-blue-100 rounded-lg">
                      <span className="text-2xl font-semibold text-blue-800 text-center">{slide}</span>
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
  );
};

export default HeroSection;