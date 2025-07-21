import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { BookCopy, BookMarked } from 'lucide-react';

const MataPelajaranPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Kurikulum', href: '/dashboard/manajemen-kurikulum/mata-pelajaran', icon: <BookCopy className="h-4 w-4" /> },
    { label: 'Mata Pelajaran', icon: <BookMarked className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Manajemen Mata Pelajaran" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Mata Pelajaran</CardTitle>
            <CardDescription>Kelola daftar mata pelajaran yang diajarkan.</CardDescription>
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

export default MataPelajaranPage;