import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useGetRoleByIdQuery, useGetPermissionMatrixQuery, type PermissionMatrixItem } from '@/store/slices/roleApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Info, Briefcase, UserCog, Edit, ShieldCheck, Layers, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { PermissionMatrix } from '@/components/role/PermissionMatrix';

const PeranDetailPage: React.FC = () => {
  const { id } = useParams();
  const roleId = Number(id);

  const { data: role, isLoading: isLoadingRole, isError: isErrorRole } = useGetRoleByIdQuery(roleId, {
    skip: !roleId,
  });

  const { data: matrixData, isLoading: isLoadingMatrix } = useGetPermissionMatrixQuery(roleId, {
    skip: !roleId,
  });

  const title = role ? `Detail Peran: ${role.name}` : 'Detail Peran';
  const breadcrumbItems = [
    { label: 'Manajemen Staf', href: '/dashboard/staf', icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Peran', href: '/dashboard/peran', icon: <UserCog className="h-4 w-4" /> },
    { label: title, icon: <Info className="h-4 w-4" /> },
  ];

  // Compute permission matrix value items from hierarchical modules
  const matrixValue: PermissionMatrixItem[] = useMemo(() => {
    const rawModules = (matrixData as Record<string, unknown>)?.modules || [];
    const items: PermissionMatrixItem[] = [];

    const traverse = (nodes: unknown[]) => {
      nodes.forEach((rawNode) => {
        const node = rawNode as Record<string, unknown>;
        if (!node.is_group && (Array.isArray(node.permissions) && node.permissions.length > 0 || Array.isArray(node.custom_permissions) && node.custom_permissions.length > 0)) {
          items.push({
            menu_id: Number(node.id),
            permissions: (node.permissions as string[]) || [],
            custom_permissions: (node.custom_permissions as string[]) || [],
          });
        }
        if (Array.isArray(node.children) && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };

    if (Array.isArray(rawModules)) {
      traverse(rawModules);
    }
    return items;
  }, [matrixData]);

  const summary = (matrixData as Record<string, unknown>)?.summary as Record<string, unknown> | undefined;
  const isFullAccess = summary?.is_full_access || role?.name === 'superadmin';
  const totalAssigned = (summary?.assigned_menus as number) ?? matrixValue.length;
  const totalMenus = (summary?.total_menus as number) ?? totalAssigned;

  if (isLoadingRole || isLoadingMatrix) {
    return (
      <DashboardLayout title="Detail Peran" role="administrasi">
        <CustomBreadcrumb items={breadcrumbItems} />
        <TableLoadingSkeleton numCols={3} />
      </DashboardLayout>
    );
  }

  if (isErrorRole || !role) {
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

  return (
    <DashboardLayout title={title} role="administrasi">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild size="sm">
            <Link to="/dashboard/peran">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
          <Button asChild size="sm" variant="primary">
            <Link to={`/dashboard/peran/${role.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Hak Akses
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nama Peran</CardTitle>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{role.name}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs uppercase">{role.guard_name}</Badge>
              {role.category && (
                <Badge variant="secondary" className="text-xs capitalize">{role.category}</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cakupan Menu</CardTitle>
            <Layers className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalAssigned} <span className="text-sm font-normal text-muted-foreground">/ {totalMenus} Modul</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalMenus > 0 ? Math.round((totalAssigned / totalMenus) * 100) : 0}% modul sistem terhubung
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tingkat Akses</CardTitle>
            <KeyRound className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="mt-1">
              {isFullAccess ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Akses Penuh (Full Control)
                </Badge>
              ) : matrixValue.length > 0 ? (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  Akses Kustom ({matrixValue.length} Menu)
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Belum Ada Akses
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isFullAccess ? 'Memiliki semua hak akses pada modul' : 'Akses dibatasi sesuai kebijakan'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Terakhir Diperbarui</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {new Date(role.updated_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pukul {new Date(role.updated_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Matrix Card */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Matriks Pemetaan Menu & Hak Akses</CardTitle>
              <CardDescription>
                Daftar menu dan hak akses aksi (Lihat, Tambah, Ubah, Hapus, Setujui) yang diberikan ke peran ini.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                <span>Aktif</span>
              </Badge>
              <Badge variant="outline" className="gap-1.5 py-1 text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/30 inline-block" />
                <span>Tidak Ada Akses</span>
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {(matrixData as Record<string, unknown>)?.modules && Array.isArray((matrixData as Record<string, unknown>).modules) && ((matrixData as Record<string, unknown>).modules as unknown[]).length > 0 ? (
            <PermissionMatrix
              modules={(matrixData as Record<string, unknown>).modules as any}
              value={matrixValue}
              onChange={() => {}}
              readOnly={true}
            />
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Belum Ada Matriks Akses</AlertTitle>
              <AlertDescription>
                Peran ini belum memiliki konfigurasi matriks menu atau hak akses. Silakan klik tombol "Edit Hak Akses" di atas untuk mengatur.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default PeranDetailPage;