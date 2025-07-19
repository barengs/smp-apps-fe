import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useGetEmployeeByIdQuery } from '@/store/slices/employeeApi';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const StaffDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const staffId = parseInt(id || '', 10);

  const { data: staff, error, isLoading } = useGetEmployeeByIdQuery(staffId, {
    skip: !staffId, // Skip query if staffId is not valid
  });

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

  // Destructure directly from staff, as per the new API structure
  const { first_name, last_name, email, code, nik, phone, address, zip_code, photo, created_at, updated_at } = staff;

  return (
    <DashboardLayout title="Detail Staf" role="administrasi">
      <div className="container mx-auto pb-4 px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-3xl font-bold">Detail Staf: {first_name} {last_name}</h2>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Informasi Pribadi</CardTitle>
            <CardDescription>Detail lengkap mengenai staf ini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {photo && (
              <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 py-2 border-b last:border-b-0">
                <span className="font-semibold text-gray-700">Foto:</span>
                <div>
                  <img src={photo} alt="Foto Staf" className="w-24 h-24 object-cover rounded-md" />
                </div>
              </div>
            )}
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 py-2 border-b last:border-b-0">
              <span className="font-semibold text-gray-700">Nama Depan:</span>
              <span className="text-gray-900">{first_name}</span>
            </div>

            <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 py-2 border-b last:border-b-0">
              <span className="font-semibold text-gray-700">Nama Belakang:</span>
              <span className="text-gray-900">{last_name}</span>
            </div>

            <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 py-2 border-b last:border-b-0">
              <span className="font-semibold text-gray-700">Email:</span>
              <span className="text-gray-900">{email}</span>
            </div>

            <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 py-2 border-b last:border-b-0">
              <span className="font-semibold text-gray-700">Kode Staf:</span>
              <span className="text-gray-900">{code || '-'}</span>
            </div>

            <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 py-2 border-b last:border-b-0">
              <span className="font-semibold text-gray-700">NIK:</span>
              <span className="text-gray-900">{nik || '-'}</span>
            </div>

            <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 py-2 border-b last:border-b-0">
              <span className="font-semibold text-gray-700">Telepon:</span>
              <span className="text-gray-900">{phone || '-'}</span>
            </div>

            <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 py-2 border-b last:border-b-0">
              <span className="font-semibold text-gray-700">Alamat:</span>
              <span className="text-gray-900">{address || '-'}</span>
            </div>

            <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 py-2 border-b last:border-b-0">
              <span className="font-semibold text-gray-700">Kode Pos:</span>
              <span className="text-gray-900">{zip_code || '-'}</span>
            </div>

            {/* Removed roles display as it's not in the provided detail API structure */}
            <div className="text-sm text-muted-foreground italic pt-2">
              * Informasi peran tidak tersedia dalam detail staf ini.
            </div>

            <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 py-2 border-b last:border-b-0">
              <span className="font-semibold text-gray-700">Tanggal Dibuat:</span>
              <span className="text-gray-900">{new Date(created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 py-2 last:border-b-0">
              <span className="font-semibold text-gray-700">Terakhir Diperbarui:</span>
              <span className="text-gray-900">{new Date(updated_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StaffDetailPage;