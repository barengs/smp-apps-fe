import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ProgramTable from './ProgramTable';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { GraduationCap, ClipboardList } from 'lucide-react';

const ProgramPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Pendidikan', href: '/dashboard/pendidikan/program', icon: <GraduationCap className="h-4 w-4" /> },
    { label: 'Program', icon: <ClipboardList className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Manajemen Program" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Informasi Program</CardTitle>
            <CardDescription>Kelola daftar program pendidikan yang tersedia di sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProgramTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProgramPage;