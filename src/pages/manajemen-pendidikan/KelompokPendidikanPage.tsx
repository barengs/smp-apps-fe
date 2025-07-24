import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { GraduationCap, Compass } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import KelompokPendidikanTable from './KelompokPendidikanTable';
import KelompokPendidikanForm from './KelompokPendidikanForm';
import { KelompokPendidikan } from '@/types/pendidikan'; // Menggunakan alias path

const KelompokPendidikanPage: React.FC = () => {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<KelompokPendidikan | null>(null);

  const handleAddData = () => {
    setSelectedData(null);
    setIsFormOpen(true);
  };

  const handleEditData = (data: KelompokPendidikan) => {
    setSelectedData(data);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedData(null);
  };

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: t('sidebar.educationManagement'), href: '#', icon: <GraduationCap className="h-4 w-4" /> },
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
            <KelompokPendidikanTable onAddData={handleAddData} onEditData={handleEditData} />
          </CardContent>
        </Card>
      </div>
      <KelompokPendidikanForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        initialData={selectedData}
      />
    </DashboardLayout>
  );
};

export default KelompokPendidikanPage;