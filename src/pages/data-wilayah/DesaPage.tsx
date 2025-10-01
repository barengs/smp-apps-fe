import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DesaTable from './DesaTable.tsx';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Map, Home } from 'lucide-react';
import { useLazyGetVillagesQuery } from '@/store/slices/villageApi';

const DesaPage: React.FC = () => {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  
  const [triggerGetVillages, { data, isLoading, isError }] = useLazyGetVillagesQuery();

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Data Wilayah', href: '/dashboard/wilayah/provinsi', icon: <Map className="h-4 w-4" /> },
    { label: 'Desa', icon: <Home className="h-4 w-4" /> },
  ];

  React.useEffect(() => {
    triggerGetVillages({
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
    });
  }, [pagination, triggerGetVillages]);

  return (
    <DashboardLayout title="Manajemen Desa" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Informasi Desa</CardTitle>
            <CardDescription>Kelola daftar desa yang tersedia di sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            <DesaTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DesaPage;