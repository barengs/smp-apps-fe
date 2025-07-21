import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { BookCopy, TrendingUp } from 'lucide-react';

const KenaikanKelasPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Kurikulum', href: '/dashboard/kurikulum/kenaikan-kelas', icon: <BookCopy className="h-4 w-4" /> },
    { label: 'Kenaikan Kelas', icon: <TrendingUp className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Manajemen Kenaikan Kelas" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Kenaikan Kelas</CardTitle>
            <CardDescription>Kelola proses kenaikan kelas santri.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Fitur ini sedang dalam pengembangan.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default KenaikanKelasPage;