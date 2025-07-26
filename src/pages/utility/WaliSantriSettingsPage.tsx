import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

const WaliSantriSettingsPage: React.FC = () => {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.settings'), icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title={t('sidebar.settings')} role="wali-santri">
      <CustomBreadcrumb items={breadcrumbItems} />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t('settings.placeholder')}</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WaliSantriSettingsPage;