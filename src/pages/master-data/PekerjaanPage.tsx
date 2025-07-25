import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PekerjaanTable from './PekerjaanTable';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { ClipboardList, Briefcase } from 'lucide-react';

const PekerjaanPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Master Data', href: '/dashboard/master-data/pekerjaan', icon: <ClipboardList className="h-4 w-4" /> },
    { label: 'Pekerjaan', icon: <Briefcase className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Manajemen Pekerjaan" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pekerjaan</CardTitle>
            <CardDescription>Kelola daftar pekerjaan yang tersedia di sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            <PekerjaanTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PekerjaanPage;