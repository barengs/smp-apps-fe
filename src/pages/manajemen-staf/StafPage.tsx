import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StaffTable from './StaffTable';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Briefcase, UsersRound } from 'lucide-react';

const StafPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Staf', href: '/dashboard/staf', icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Daftar Staf', icon: <UsersRound className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Manajemen Staf" role="administrasi">
      <div className="container mx-auto pb-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Informasi Staf</CardTitle>
          </CardHeader>
          <CardContent>
            <StaffTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StafPage;