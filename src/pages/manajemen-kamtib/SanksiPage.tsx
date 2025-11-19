"use client";

import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import SanksiTable from './SanksiTable';
import { useTranslation } from 'react-i18next';

const SanksiPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <DashboardLayout title={t('sidebar.sanction')} role="administrasi">
      <div className="container mx-auto">
        <SanksiTable />
      </div>
    </DashboardLayout>
  );
};

export default SanksiPage;