import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpenText } from 'lucide-react';

const NilaiAbsensiPage: React.FC = () => {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.gradesAndAttendance'), icon: <BookOpenText className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title={t('sidebar.gradesAndAttendance')} role="wali-santri">
      <CustomBreadcrumb items={breadcrumbItems} />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('gradesAndAttendance.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t('gradesAndAttendance.placeholder')}</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NilaiAbsensiPage;