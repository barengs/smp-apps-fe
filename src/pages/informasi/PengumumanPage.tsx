import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';

const PengumumanPage: React.FC = () => {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.announcements'), icon: <Megaphone className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title={t('sidebar.announcements')} role="wali-santri">
      <CustomBreadcrumb items={breadcrumbItems} />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('announcements.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t('announcements.placeholder')}</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PengumumanPage;