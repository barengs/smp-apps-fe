import React, { useEffect, useState, useMemo } from 'react';
import LandingLayout from '../../layouts/LandingLayout';
import { BookOpenText, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import type { CarouselApi } from '@/components/ui/carousel';
import { useTranslation } from 'react-i18next';
import { useGetBeritaQuery } from '@/store/slices/beritaApi';
import RunningText from '@/components/RunningText';

const Index = () => {
  const { t } = useTranslation();
  const infoSlides = [
    t('infoSlide1'),
    t('infoSlide2'),
    t('infoSlide3'),
    t('infoSlide4'),
    t('infoSlide5'),
    t('infoSlide6'),
    t('infoSlide7'),
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

  // Fetch news data
  const { data: newsData, isLoading: isNewsLoading, isError: isNewsError } = useGetBeritaQuery();
  const newsTitles = useMemo(() => {
    if (newsData?.data) {
      return newsData.data.map(newsItem => newsItem.title);
    }
    return [];
  }, [newsData]);

  return (
    <LandingLayout title={t('welcomeTitle')}>
      <section className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white pb-12">
        <div className="text-center mb-12">
          <BookOpenText className="h-48 w-48 mx-auto mb-8 text-primary" />
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            {t('welcomeTitle')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('welcomeSubtitle')}
          </p>
        </div>

        {/* Running Text Section */}
        {!isNewsLoading && !isNewsError && newsTitles.length > 0 && (
          <div className="w-full mb-12">
            <RunningText items={newsTitles} />
          </div>
        )}

        <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl">
          <div className="flex justify-center mb-2">
            <Info className="h-8 w-8 text-gray-700" />
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">{t('infoTitle')}</h2>
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