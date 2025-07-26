import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark } from 'lucide-react';

const BankSantriPage: React.FC = () => {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.bankSantri'), icon: <Landmark className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title={t('sidebar.bankSantri')} role="wali-santri">
      <CustomBreadcrumb items={breadcrumbItems} />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('bankSantri.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t('bankSantri.placeholder')}</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BankSantriPage;