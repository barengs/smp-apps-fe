import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import RombelTable from './RombelTable';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { GraduationCap, Users } from 'lucide-react';

const RombelPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Pendidikan', href: '/dashboard/pendidikan/program', icon: <GraduationCap className="h-4 w-4" /> },
    { label: 'Rombongan Belajar', icon: <Users className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Manajemen Rombongan Belajar" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Informasi Rombongan Belajar</CardTitle>
            <CardDescription>Kelola daftar rombongan belajar yang tersedia di sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            <RombelTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RombelPage;