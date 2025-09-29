import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import InstitusiPendidikanTable from './InstitusiPendidikanTable';

const InstitusiPendidikanPage: React.FC = () => {
  const { t } = useTranslation();

  const breadcrumbs = [
    {
      label: t('sidebar.dashboard'),
      href: '/dashboard/administrasi',
    },
    {
      label: t('sidebar.curriculum'),
    },
    {
      label: t('sidebar.institusiPendidikan'),
      href: '/dashboard/manajemen-kurikulum/institusi-pendidikan',
    },
  ];

  return (
    <DashboardLayout title={t('institusiPendidikanPage.title')} role="administrasi">
      <CustomBreadcrumb items={breadcrumbs} />
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">{t('institusiPendidikanPage.title')}</h1>
          <p className="text-muted-foreground">{t('institusiPendidikanPage.description')}</p>
        </div>
      </div>
      <InstitusiPendidikanTable />
    </DashboardLayout>
  );
};

export default InstitusiPendidikanPage;