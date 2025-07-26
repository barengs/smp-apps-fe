import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

const GuruTugasPage: React.FC = () => {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.santriManagement'), href: "/dashboard/santri", icon: <User className="h-4 w-4" /> },
    { label: t('sidebar.teacherAssignment'), icon: <User className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title={t('sidebar.teacherAssignment')} role="administrasi">
      <CustomBreadcrumb items={breadcrumbItems} />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('teacherAssignment.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t('teacherAssignment.placeholder')}</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GuruTugasPage;