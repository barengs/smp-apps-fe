import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Briefcase, UserSearch } from 'lucide-react';

const PenanggungJawabPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Magang', href: '/dashboard/guru-tugas', icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Penanggung Jawab', icon: <UserSearch className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Manajemen Penanggung Jawab Magang" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Informasi Penanggung Jawab Magang</CardTitle>
            <CardDescription>Kelola daftar penanggung jawab magang di sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Halaman ini akan menampilkan daftar penanggung jawab magang.</p>
            {/* Di sini nanti akan ditambahkan komponen tabel dan form */}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PenanggungJawabPage;