import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WaliSantriTable from './WaliSantriTable';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Users, UserPlus } from 'lucide-react';

const WaliSantriListPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Santri', href: '/dashboard/santri', icon: <Users className="h-4 w-4" /> },
    { label: 'Wali Santri', icon: <UserPlus className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Manajemen Wali Santri" role="administrasi">
      <div className="container mx-auto pb-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Informasi Wali Santri</CardTitle>
          </CardHeader>
          <CardContent>
            <WaliSantriTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WaliSantriListPage;