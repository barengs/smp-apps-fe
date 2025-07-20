import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HakAksesTable from './HakAksesTable';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Briefcase, Key } from 'lucide-react';

const HakAksesPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Staf', href: '/dashboard/staf', icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Hak Akses', icon: <Key className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Manajemen Hak Akses" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Daftar Hak Akses</CardTitle>
          </CardHeader>
          <CardContent>
            <HakAksesTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HakAksesPage;