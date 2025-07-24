import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { GraduationCap, Compass } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

const KelompokPendidikanPage: React.FC = () => {
  const { t } = useTranslation();

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: t('sidebar.educationManagement'), href: '/dashboard/pendidikan/jenjang', icon: <GraduationCap className="h-4 w-4" /> },
    { label: t('sidebar.educationGroup'), icon: <Compass className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title={t('sidebar.educationGroup')} role="administrasi">
      <div className="container mx-auto pb-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>{t('sidebar.educationGroup')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Ini adalah halaman untuk manajemen kelompok pendidikan. Konten akan ditambahkan di sini.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default KelompokPendidikanPage;