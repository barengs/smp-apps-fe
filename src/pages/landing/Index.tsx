import React, { useEffect, useState } from 'react';
import LandingLayout from '../../layouts/LandingLayout';
import { BookOpenText, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import type { CarouselApi } from '@/components/ui/carousel';

const Index = () => {
  const infoSlides = [
    "Selamat datang di aplikasi manajemen pesantren kami!",
    "Memudahkan pendaftaran santri baru.",
    "Informasi kegiatan pesantren terkini.",
    "Akses nilai dan absensi santri.",
    "Komunikasi efektif antara wali dan administrasi.",
    "Fitur baru akan segera hadir!",
    "Dukungan penuh untuk pengguna.",
  ];

  const [api, setApi] = useState<CarouselApi>();
  const autoplayInterval = 3000;

  useEffect(() => {
    if (!api) {
      return;
    }

    const timer = setInterval(() => {
      api.scrollNext();
    }, autoplayInterval);

    return () => {
      clearInterval(timer);
    };
  }, [api, autoplayInterval]);

  return (
    <LandingLayout>
      <section className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white pb-12">
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
            <Info className="h-8 w-8 text-gray-700" />
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Informasi Singkat</h2>
          <Carousel className="w-full" setApi={setApi}>
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
    </LandingLayout>
  );
};

export default Index;