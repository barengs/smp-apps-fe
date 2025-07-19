import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useGetEmployeesQuery } from '@/store/slices/employeeApi';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const StaffDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const staffId = parseInt(id || '', 10);

  const { data: employeesData, error, isLoading } = useGetEmployeesQuery();

  const staff = useMemo(() => {
    if (employeesData?.data && staffId) {
      return employeesData.data.find(emp => emp.id === staffId);
    }
    return undefined;
  }, [employeesData, staffId]);

  if (isLoading) {
    return (
      <DashboardLayout title="Detail Staf" role="administrasi">
        <div className="container mx-auto py-4 px-4">
          <p>Memuat detail staf...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    let errorMessage = 'Terjadi kesalahan saat memuat detail staf.';
    if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage = (error as any).message;
    }
    toast.error(errorMessage);
    return (
      <DashboardLayout title="Detail Staf" role="administrasi">
        <div className="container mx-auto py-4 px-4">
          <p className="text-red-500">{errorMessage}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!staff) {
    return (
      <DashboardLayout title="Detail Staf" role="administrasi">
        <div className="container mx-auto py-4 px-4">
          <p>Staf tidak ditemukan.</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Detail Staf" role="administrasi">
      <div className="container mx-auto pb-4 px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-3xl font-bold">Detail Staf: {staff.employee.first_name} {staff.employee.last_name}</h2>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Informasi Pribadi</CardTitle>
            <CardDescription>Detail lengkap mengenai staf ini.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="font-semibold">Nama Depan:</div>
              <div>{staff.employee.first_name}</div>

              <div className="font-semibold">Nama Belakang:</div>
              <div>{staff.employee.last_name}</div>

              <div className="font-semibold">Email:</div>
              <div>{staff.email}</div>

              <div className="font-semibold">Peran:</div>
              <div className="flex flex-wrap gap-1">
                {staff.roles.map((role) => (
                  <Badge key={role.id} variant="outline">
                    {role.name}
                  </Badge>
                ))}
              </div>

              <div className="font-semibold">Tanggal Dibuat:</div>
              <div>{new Date(staff.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>

              <div className="font-semibold">Terakhir Diperbarui:</div>
              <div>{new Date(staff.updated_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StaffDetailPage;