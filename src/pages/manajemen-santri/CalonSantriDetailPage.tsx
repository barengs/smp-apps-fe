import React from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useGetCalonSantriByIdQuery } from '@/store/slices/calonSantriApi';
import { User } from 'lucide-react';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { Badge } from '@/components/ui/badge'; // Import Badge component

const CalonSantriDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const santriId = Number(id);

  const { data: apiResponse, isLoading, isError, error } = useGetCalonSantriByIdQuery(santriId);

  const calonSantri = apiResponse?.data;

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/administrasi' },
    { label: 'Pendaftaran Santri Baru', href: '/dashboard/pendaftaran-santri' }, // Corrected href
    { label: 'Detail Calon Santri', icon: <User className="h-4 w-4" /> },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Detail Calon Santri" role="administrasi">
        <div className="container mx-auto px-4 pb-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <TableLoadingSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    console.error("Error fetching calon santri detail:", error);
    return (
      <DashboardLayout title="Detail Calon Santri" role="administrasi">
        <div className="container mx-auto px-4 pb-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <div className="text-red-500">Terjadi kesalahan saat memuat detail data. Silakan cek konsol untuk detail.</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!calonSantri) {
    return (
      <DashboardLayout title="Detail Calon Santri" role="administrasi">
        <div className="container mx-auto px-4 pb-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <div className="text-gray-500">Data calon santri tidak ditemukan.</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Detail Calon Santri" role="administrasi">
      <div className="container mx-auto px-4 pb-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Detail Calon Santri: {calonSantri.first_name} {calonSantri.last_name}</CardTitle>
            <CardDescription>Informasi lengkap mengenai calon santri.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Informasi Umum</h3>
                <p><strong>No. Pendaftaran:</strong> {calonSantri.registration_number}</p>
                <p><strong>Tanggal Daftar:</strong> {new Date(calonSantri.created_at).toLocaleDateString('id-ID')}</p>
                <p><strong>Status:</strong> <Badge className="capitalize">{calonSantri.status}</Badge></p>
                <p><strong>Nama Lengkap:</strong> {calonSantri.first_name} {calonSantri.last_name}</p>
                <p><strong>Jenis Kelamin:</strong> {calonSantri.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                <p><strong>Tempat, Tanggal Lahir:</strong> {calonSantri.born_in}, {new Date(calonSantri.born_at).toLocaleDateString('id-ID')}</p>
                <p><strong>Alamat:</strong> {calonSantri.address}</p>
                <p><strong>Kode Pos:</strong> {calonSantri.postal_code || '-'}</p>
                <p><strong>Telepon:</strong> {calonSantri.phone || '-'}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Informasi Pendidikan & Lainnya</h3>
                <p><strong>Asal Sekolah:</strong> {calonSantri.previous_school || '-'}</p>
                <p><strong>Alamat Sekolah Asal:</strong> {calonSantri.previous_school_address || '-'}</p>
                <p><strong>Nomor Ijazah:</strong> {calonSantri.certificate_number || '-'}</p>
                {/* You can add more fields here based on CalonSantri interface */}
                {calonSantri.photo && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Foto</h3>
                    <img src={calonSantri.photo} alt="Foto Calon Santri" className="w-32 h-32 object-cover rounded-md" />
                  </div>
                )}
              </div>
            </div>
            {calonSantri.parent && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">Informasi Orang Tua/Wali</h3>
                <p><strong>Nama Ayah/Ibu:</strong> {calonSantri.parent.first_name} {calonSantri.parent.last_name}</p>
                <p><strong>Hubungan:</strong> {calonSantri.parent.parent_as}</p>
                <p><strong>NIK:</strong> {calonSantri.parent.nik}</p>
                <p><strong>No. KK:</strong> {calonSantri.parent.kk}</p>
                <p><strong>Telepon Orang Tua:</strong> {calonSantri.parent.phone || '-'}</p>
                <p><strong>Email Orang Tua:</strong> {calonSantri.parent.email || '-'}</p>
                <p><strong>Pekerjaan:</strong> {calonSantri.parent.occupation || '-'}</p>
                <p><strong>Pendidikan:</strong> {calonSantri.parent.education || '-'}</p>
                <p><strong>Alamat Domisili:</strong> {calonSantri.parent.domicile_address || '-'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CalonSantriDetailPage;