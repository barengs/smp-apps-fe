import React from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useGetRoleByIdQuery } from '@/store/slices/roleApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Info, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';

const PeranDetailPage: React.FC = () => {
  const { id } = useParams();
  const roleId = Number(id);
  const { data: role, isLoading, isError } = useGetRoleByIdQuery(roleId, {
    skip: !roleId,
  });

  const title = role ? `Detail Peran: ${role.name}` : 'Detail Peran';
  const breadcrumbItems = [
    { label: 'Peran', href: '/dashboard/peran', icon: <Shield className="h-4 w-4" /> },
    { label: title, icon: <Info className="h-4 w-4" /> },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Detail Peran" role="administrasi">
        <CustomBreadcrumb items={breadcrumbItems} />
        <TableLoadingSkeleton numCols={3} />
      </DashboardLayout>
    );
  }

  if (isError || !role) {
    return (
      <DashboardLayout title="Detail Peran" role="administrasi">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Alert variant="destructive">
          <AlertTitle>Gagal memuat</AlertTitle>
          <AlertDescription>Data peran tidak ditemukan atau terjadi kesalahan.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link to="/dashboard/peran">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar Peran
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const permissions = role.permissions ?? [];
  const menus = (role as any).menus ?? [];

  return (
    <DashboardLayout title={title} role="administrasi">
      <div className="mb-4 flex items-center justify-between">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Button variant="outline" asChild>
          <Link to="/dashboard/peran">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">{role.name}</CardTitle>
            <CardDescription>Informasi dasar peran</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Guard</span>
              <span className="font-medium">{role.guard_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Dibuat</span>
              <span className="font-medium">{new Date(role.created_at).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Diubah</span>
              <span className="font-medium">{new Date(role.updated_at).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Hak Akses</CardTitle>
            <CardDescription>Daftar permission yang dimiliki peran ini</CardDescription>
          </CardHeader>
          <CardContent>
            {permissions.length === 0 ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Tidak ada hak akses</AlertTitle>
                <AlertDescription>Peran ini belum memiliki hak akses.</AlertDescription>
              </Alert>
            ) : (
              <div className="flex flex-wrap gap-2">
                {permissions.map((p, idx) => (
                  <Badge key={idx} variant="secondary">{p.name}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Menu</CardTitle>
            <CardDescription>Menu yang terhubung ke peran ini</CardDescription>
          </CardHeader>
          <CardContent>
            {Array.isArray(menus) && menus.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {menus.map((m: any) => (
                  <Badge key={m.id} variant="outline">{m.title}</Badge>
                ))}
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Menu belum tersedia</AlertTitle>
                <AlertDescription>
                  Data menu belum disertakan oleh backend untuk peran ini.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PeranDetailPage;