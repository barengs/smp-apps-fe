import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Shield, AlertTriangle } from 'lucide-react';

const PelanggaranPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Kamtib', href: '/dashboard/manajemen-kamtib/pelanggaran', icon: <Shield className="h-4 w-4" /> },
    { label: 'Pelanggaran', icon: <AlertTriangle className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Manajemen Pelanggaran" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Pelanggaran Santri</CardTitle>
            <CardDescription>Kelola data pelanggaran yang dilakukan oleh santri.</CardDescription>
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

export default PelanggaranPage;