import React from 'react';
import { useGetStudentCardSettingsQuery } from '@/store/slices/studentCardApi';

export const ReportKopSurat: React.FC = () => {
  const { data: settingsResponse } = useGetStudentCardSettingsQuery();
  const settings = settingsResponse?.data;
  const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL as string;

  if (!settings?.kop_surat) {
    return (
      <div className="text-center py-4 border-b-2 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-tight">Laporan Pesantren</h1>
      </div>
    );
  }

  const kopSuratUrl = `${STORAGE_BASE_URL}${settings.kop_surat.startsWith('/') ? settings.kop_surat.substring(1) : settings.kop_surat}`;

  return (
    <div className="w-full mb-6 print:mb-8">
      <img 
        src={kopSuratUrl} 
        alt="Kop Surat" 
        className="w-full h-auto object-contain"
        onError={(e) => {
          // Fallback if image fails to load
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      <div className="border-b-2 border-black mt-2" />
    </div>
  );
};
