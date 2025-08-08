import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useGetCalonSantriByIdQuery } from '@/store/slices/calonSantriApi';
import { User, Pencil, ArrowLeft, Printer, DollarSign } from 'lucide-react'; // Import DollarSign icon
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const BASE_IMAGE_URL = "https://api.smp.barengsaya.com/storage/";

const CalonSantriDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const santriId = Number(id);
  const navigate = useNavigate();

  const { data: apiResponse, isLoading, isError, error } = useGetCalonSantriByIdQuery(santriId);

  const calonSantri = apiResponse?.data;

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/administrasi' },
    { label: 'Pendaftaran Santri Baru', href: '/dashboard/pendaftaran-santri' },
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

  // Helper function to render a detail row
  const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-2 gap-x-4 py-1">
      <span className="font-medium text-gray-600">{label}</span>
      <span>: {value || '-'}</span>
    </div>
  );

  const calonSantriPhotoUrl = calonSantri.photo ? `${BASE_IMAGE_URL}${calonSantri.photo}` : null;

  // Format payment amount to IDR
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrintForm = () => {
    // Placeholder for print logic
    console.log('Cetak Formulir clicked for ID:', santriId);
    alert('Fungsi cetak formulir akan segera diimplementasikan!');
  };

  const handleProcessPayment = () => {
    // Placeholder for payment processing logic
    console.log('Proses Pembayaran clicked for ID:', santriId);
    alert('Fungsi proses pembayaran akan segera diimplementasikan!');
  };

  return (
    <DashboardLayout title="Detail Calon Santri" role="administrasi">
      <div className="container mx-auto px-4 pb-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Detail Calon Santri: {`${calonSantri.first_name} ${calonSantri.last_name}`.toUpperCase()}</CardTitle>
              <CardDescription>Informasi lengkap mengenai calon santri.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/dashboard/pendaftaran-santri')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => navigate(`/dashboard/pendaftaran-santri/edit/${santriId}`)} size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handlePrintForm} size="icon">
                      <Printer className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cetak Formulir</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleProcessPayment} size="icon">
                      <DollarSign className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Proses Pembayaran</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Informasi Umum</h3>
                <DetailRow label="No. Pendaftaran" value={calonSantri.registration_number} />
                <DetailRow label="Tanggal Daftar" value={new Date(calonSantri.created_at).toLocaleDateString('id-ID')} />
                <DetailRow label="Status Pendaftaran" value={<Badge className="capitalize">{calonSantri.status}</Badge>} />
                <DetailRow label="Status Pembayaran" value={<Badge className="capitalize">{calonSantri.payment_status}</Badge>} />
                <DetailRow label="Jumlah Pembayaran" value={formatCurrency(calonSantri.payment_amount)} />
                <DetailRow label="Nama Lengkap" value={`${calonSantri.first_name} ${calonSantri.last_name}`.toUpperCase()} />
                <DetailRow label="Jenis Kelamin" value={calonSantri.gender === 'L' ? 'Laki-laki' : 'Perempuan'} />
                <DetailRow label="Tempat, Tanggal Lahir" value={`${calonSantri.born_in}, ${new Date(calonSantri.born_at).toLocaleDateString('id-ID')}`} />
                <DetailRow label="Alamat" value={calonSantri.address} />
                <DetailRow label="Kode Pos" value={calonSantri.postal_code} />
                <DetailRow label="Telepon" value={calonSantri.phone} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Informasi Pendidikan & Lainnya</h3>
                <DetailRow label="Asal Sekolah" value={calonSantri.previous_school} />
                <DetailRow label="Alamat Sekolah Asal" value={calonSantri.previous_school_address} />
                <DetailRow label="Nomor Ijazah" value={calonSantri.certificate_number} />
                {/* Add more fields here if needed */}

                {/* Always render the photo card, show Pencil icon if no photo */}
                <Card className="mt-4 p-4 w-fit mx-auto">
                  <CardContent className="p-0 flex justify-center items-center">
                    <div className="w-[152px] h-[228px] border rounded-md overflow-hidden flex items-center justify-center bg-gray-100 shadow-sm">
                      {calonSantriPhotoUrl ? (
                        <img
                          src={calonSantriPhotoUrl}
                          alt="Foto Calon Santri"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Pencil className="h-24 w-24 text-muted-foreground" /> // Display Pencil icon
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="px-4 py-2 text-center border-t">
                    <h3 className="text-xl font-bold w-full mb-0">{`${calonSantri.first_name} ${calonSantri.last_name}`.toUpperCase()}</h3>
                  </CardFooter>
                </Card>
              </div>
            </div>

            {calonSantri.parent && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">Informasi Orang Tua/Wali</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <div>
                    <DetailRow label="Nama Ayah/Ibu" value={`${calonSantri.parent.first_name} ${calonSantri.parent.last_name || ''}`} />
                    <DetailRow label="Hubungan" value={calonSantri.parent.parent_as} />
                    <DetailRow label="NIK" value={calonSantri.parent.nik} />
                    <DetailRow label="No. KK" value={calonSantri.parent.kk} />
                  </div>
                  <div>
                    <DetailRow label="Telepon Orang Tua" value={calonSantri.parent.phone} />
                    <DetailRow label="Email Orang Tua" value={calonSantri.parent.email} />
                    <DetailRow label="Pekerjaan" value={calonSantri.parent.occupation} />
                    <DetailRow label="Pendidikan" value={calonSantri.parent.education} />
                    <DetailRow label="Alamat Domisili" value={calonSantri.parent.domicile_address} />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CalonSantriDetailPage;