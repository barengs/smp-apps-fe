import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';
import TeacherAssignmentTable from './TeacherAssignmentTable';

const PenugasanGuruPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/administrasi' },
    { label: 'Manajemen Kurikulum', href: '/dashboard/manajemen-kurikulum/mata-pelajaran' },
    { label: 'Penugasan Guru', icon: <UserCheck className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Penugasan Guru" role="administrasi">
      <div className="container mx-auto px-4 pb-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Manajemen Penugasan Guru</CardTitle>
            <CardDescription>Kelola guru yang mengajar mata pelajaran tertentu di halaman ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <TeacherAssignmentTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PenugasanGuruPage;