"use client";

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PeranForm from './PeranForm';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Briefcase, UserCog } from 'lucide-react';
import { useGetRoleByIdQuery } from '@/store/slices/roleApi';
import { Skeleton } from '@/components/ui/skeleton';

const PeranEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const roleId = Number(id);
  const { data: role, isLoading } = useGetRoleByIdQuery(roleId, { skip: Number.isNaN(roleId) });

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Staf', href: '/dashboard/staf', icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Peran', href: '/dashboard/peran', icon: <UserCog className="h-4 w-4" /> },
    { label: 'Edit Peran' },
  ];

  const initialData = role
    ? {
        id: role.id,
        roleName: role.name,
        description: '', // backend belum menyediakan deskripsi
        usersCount: 0,
        // untuk explicitPermissions, PeranForm akan memetakan dari permission names
        accessRights: (role.permissions || []).map(p => p.name),
      }
    : undefined;

  return (
    <DashboardLayout title="Edit Peran" role="administrasi">
      <div className="container mx-auto px-4 pb-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Form Edit Peran</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-96 w-full" />
              </div>
            )}
            {!isLoading && (
              <PeranForm
                initialData={initialData}
                onSuccess={() => navigate('/dashboard/peran')}
                onCancel={() => navigate('/dashboard/peran')}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PeranEditPage;