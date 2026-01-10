"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PeranForm from './PeranForm';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Briefcase, UserCog } from 'lucide-react';

const PeranAddPage: React.FC = () => {
  const navigate = useNavigate();

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Staf', href: '/dashboard/staf', icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Peran', href: '/dashboard/peran', icon: <UserCog className="h-4 w-4" /> },
    { label: 'Tambah Peran' },
  ];

  return (
    <DashboardLayout title="Tambah Peran" role="administrasi">
      <div className="container mx-auto px-4 pb-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Form Tambah Peran</CardTitle>
          </CardHeader>
          <CardContent>
            <PeranForm
              onSuccess={() => navigate('/dashboard/peran')}
              onCancel={() => navigate('/dashboard/peran')}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PeranAddPage;