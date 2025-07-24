import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Users, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SantriFormPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Santri', href: '/dashboard/santri', icon: <Users className="h-4 w-4" /> },
    { label: 'Tambah Santri', icon: <PlusCircle className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Tambah Santri Baru" role="administrasi">
      <div className="container mx-auto pb-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Formulir Tambah Santri Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Ini adalah halaman untuk menambahkan santri baru. Formulir akan dibangun di sini.</p>
            {/* TODO: Implement the actual form for adding a new santri */}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SantriFormPage;