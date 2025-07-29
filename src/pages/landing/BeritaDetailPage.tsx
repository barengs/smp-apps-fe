import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetBeritaByIdQuery } from '@/store/slices/beritaApi';
import LandingLayout from '@/layouts/LandingLayout';
import { Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const BeritaDetailPage = () => {
  const { id: beritaId } = useParams<{ id: string }>();

  // Pastikan beritaId ada sebelum memanggil query
  const { data: beritaData, isLoading, isError, error } = useGetBeritaByIdQuery(Number(beritaId), {
    skip: !beritaId,
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      );
    }

    if (isError || !beritaData?.data) {
      const errorMessage = (error as any)?.data?.message || 'Berita tidak ditemukan atau terjadi kesalahan.';
      return (
        <div className="text-center text-red-500">
          <p>{errorMessage}</p>
        </div>
      );
    }

    const berita = beritaData.data;
    const formattedDate = format(new Date(berita.created_at), "eeee, dd MMMM yyyy", { locale: id });

    return (
      <article className="bg-white shadow-lg rounded-lg p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{berita.title}</h1>
        <div className="flex items-center text-gray-500 mb-6">
          <Calendar className="h-4 w-4 mr-2" />
          <time dateTime={berita.created_at}>{formattedDate}</time>
        </div>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: berita.content }}
        />
      </article>
    );
  };

  return (
    <LandingLayout title={beritaData?.data?.title || 'Detail Berita'}>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto max-w-4xl px-4">
          {renderContent()}
        </div>
      </div>
    </LandingLayout>
  );
};

export default BeritaDetailPage;