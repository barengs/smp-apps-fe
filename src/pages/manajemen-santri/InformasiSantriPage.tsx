import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';

const InformasiSantriPage: React.FC = () => {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.santriInfo'), icon: <User className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title={t('sidebar.santriInfo')} role="wali-santri">
      <CustomBreadcrumb items={breadcrumbItems} />
      <h2 className="text-2xl font-bold mb-4">{t('sidebar.santriInfo')}</h2>
      <p>Ini adalah halaman untuk menampilkan informasi detail santri.</p>
      {/* Konten informasi santri akan ditambahkan di sini */}
    </DashboardLayout>
  );
};

export default InformasiSantriPage;