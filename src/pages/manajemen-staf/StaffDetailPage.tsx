import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useGetEmployeeByIdQuery } from '@/store/slices/employeeApi';
import * as toast from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { User, Briefcase, UsersRound, ArrowLeft, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';

const DetailRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 py-2 border-b last:border-b-0">
    <span className="font-semibold text-gray-700">{label}:</span>
    <div className="text-gray-900 break-words">{value || '-'}</div>
  </div>
);

const StaffDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const staffId = parseInt(id || '', 10);

  useEffect(() => {
    if (isNaN(staffId)) {
      toast.showError('ID staf tidak valid.');
      navigate('/dashboard/staf');
    }
  }, [staffId, navigate]);

  const { data: responseData, error, isLoading } = useGetEmployeeByIdQuery(staffId, {
    skip: isNaN(staffId),
  });

  useEffect(() => {
    if (error || (responseData && !responseData.data)) {
      toast.showError('Gagal memuat detail staf atau staf tidak ditemukan.');
      navigate('/dashboard/staf');
    }
  }, [error, responseData, navigate]);

  const staffData = responseData?.data;
  const fullName = staffData ? `${staffData.first_name || ''} ${staffData.last_name || ''}`.trim() : 'Detail Staf';

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Staf', href: '/dashboard/staf', icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Daftar Staf', href: '/dashboard/staf', icon: <UsersRound className="h-4 w-4" /> },
    { label: fullName, icon: <User className="h-4 w-4" /> },
  ];

  const handleEdit = () => {
    navigate(`/dashboard/staf/${staffId}/edit`);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Detail Staf" role="administrasi">
        <div className="container mx-auto py-4 px-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 flex flex-col items-center">
                <Skeleton className="aspect-[3/4] w-full max-w-[240px] rounded-lg" />
                <Skeleton className="h-6 w-3/4 mt-4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </div>
              <div className="lg:col-span-3 space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-[150px_1fr] items-center gap-x-4">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (isNaN(staffId)) {
    return null;
  }

  if (!staffData) {
    return null;
  }

  const roles = staffData.user?.roles || [];

  return (
    <DashboardLayout title="Detail Staf" role="administrasi">
      <div className="container mx-auto pb-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Informasi Staf</CardTitle>
                <CardDescription>Detail lengkap mengenai staf ini.</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 flex flex-col items-center text-center">
              <div className="aspect-[3/4] w-full max-w-[240px] bg-muted rounded-lg flex items-center justify-center overflow-hidden border">
                {staffData.photo ? (
                  <img src={staffData.photo} alt={`Foto ${fullName}`} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-24 w-24 text-muted-foreground" />
                )}
              </div>
              <h3 className="mt-4 text-xl font-bold">{fullName}</h3>
              <p className="text-sm text-muted-foreground">{staffData.email || '-'}</p>
            </div>
            <div className="lg:col-span-3">
              <DetailRow label="Nama Depan" value={staffData.first_name} />
              <DetailRow label="Nama Belakang" value={staffData.last_name} />
              <DetailRow label="Email" value={staffData.email} />
              <DetailRow label="Kode Staf" value={staffData.code} />
              <DetailRow label="NIK" value={staffData.nik} />
              <DetailRow label="Telepon" value={staffData.phone} />
              <DetailRow label="Alamat" value={staffData.address} />
              <DetailRow label="Kode Pos" value={staffData.zip_code} />
              <DetailRow label="Username" value={staffData.user?.name} />
              <DetailRow label="Gender" value={staffData.gender} />
              <DetailRow label="Status" value={staffData.status} />
              <DetailRow label="Peran" value={
                roles && roles.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {roles.map((role, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{role.name}</Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 italic">Tidak ada peran</span>
                )
              } />
              <DetailRow label="Tanggal Dibuat" value={staffData.created_at ? new Date(staffData.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'} />
              <DetailRow label="Terakhir Diperbarui" value={staffData.updated_at ? new Date(staffData.updated_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'} />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StaffDetailPage;