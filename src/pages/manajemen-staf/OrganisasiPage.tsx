import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building } from 'lucide-react';

const OrganisasiPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/administrasi' },
    { label: 'Manajemen Staf' },
    { label: 'Organisasi', icon: <Building className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Manajemen Organisasi" role="administrasi">
      <div className="container mx-auto px-4 pb-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Manajemen Organisasi</CardTitle>
            <CardDescription>Kelola struktur organisasi dan departemen di sini.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Halaman ini akan digunakan untuk mengelola data organisasi. Fitur akan ditambahkan di kemudian hari.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default OrganisasiPage;