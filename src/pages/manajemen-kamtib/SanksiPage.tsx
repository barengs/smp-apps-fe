"use client";

import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import SanksiTable from './SanksiTable';
import { useTranslation } from 'react-i18next';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const SanksiPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <DashboardLayout title={t('sidebar.sanction')} role="administrasi">
      <div className="container mx-auto space-y-4">
        <CustomBreadcrumb
          items={[
            { label: t('sidebar.securityManagement'), href: '/dashboard/manajemen-kamtib/pelanggaran' },
            { label: t('sidebar.sanction') },
          ]}
        />
        <Card>
          <CardHeader>
            <CardTitle>{t('sidebar.sanction')}</CardTitle>
          </CardHeader>
          <CardContent>
            <SanksiTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SanksiPage;