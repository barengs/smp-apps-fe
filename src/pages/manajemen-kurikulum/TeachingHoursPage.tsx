import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';

const TeachingHoursPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <DashboardLayout title={t('sidebar.teachingHours')} role="administrasi">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{t('sidebar.teachingHours')}</h1>
        <p>{t('teachingHoursPage.description')}</p>
        {/* Konten untuk halaman Jam Mengajar akan ditambahkan di sini */}
      </div>
    </DashboardLayout>
  );
};

export default TeachingHoursPage;