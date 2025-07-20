import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PeranTable from './PeranTable';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Briefcase, UserCog } from 'lucide-react';

const PeranPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Staf', href: '/dashboard/staf', icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Peran', icon: <UserCog className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Manajemen Peran" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Definisi Peran</CardTitle>
          </CardHeader>
          <CardContent>
            <PeranTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PeranPage;