import React from 'react';
import { CalonSantri } from '@/types/calonSantri';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { BookOpenText, User, School, Home } from 'lucide-react'; // Removed unused icons

interface RegistrationFormPdfProps {
  calonSantri: CalonSantri;
}

const BASE_IMAGE_URL = "https://api.smp.barengsaya.com/storage/";

const DetailRow: React.FC<{ label: string; value?: React.ReactNode; className?: string }> = ({ label, value, className }) => (
  <div className={`flex text-[10px] leading-tight ${className}`}>
    <span className="font-semibold w-[80px] shrink-0">{label}</span>
    <span className="flex-grow">: {value || '-'}</span>
  </div>
);

const RegistrationFormPdf = React.forwardRef<HTMLDivElement, RegistrationFormPdfProps>(({ calonSantri }, ref) => {
  const fullNameSantri = `${calonSantri.first_name} ${calonSantri.last_name || ''}`.trim();
  const genderSantri = calonSantri.gender === 'L' ? 'Laki-laki' : 'Perempuan';
  const formattedBornAt = calonSantri.born_at ? format(new Date(calonSantri.born_at), 'dd MMMM yyyy', { locale: id }) : '-';
  const formattedRegistrationDate = calonSantri.created_at ? format(new Date(calonSantri.created_at), 'dd MMMM yyyy', { locale: id }) : '-';

  const parentFullName = calonSantri.parent ? `${calonSantri.parent.first_name} ${calonSantri.parent.last_name || ''}`.trim() : '-';
  const parentGender = calonSantri.parent?.gender === 'L' ? 'Laki-laki' : calonSantri.parent?.gender === 'P' ? 'Perempuan' : '-';

  const santriPhotoUrl = calonSantri.photo ? `${BASE_IMAGE_URL}${calonSantri.photo}` : null;

  return (
    <div ref={ref} className="p-6 bg-white text-gray-900 font-sans text-sm" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', border: '1px solid #eee' }}>
      {/* Header */}
      <div className="flex items-center justify-center mb-6 border-b pb-4">
        <BookOpenText className="h-10 w-10 mr-3 text-blue-600" />
        <h1 className="text-2xl font-bold text-center text-blue-800">FORMULIR PENDAFTARAN SANTRI BARU</h1>
      </div>

      {/* Section 1: Santri Profile & Photo */}
      <div className="flex mb-6">
        <div className="w-[40mm] h-[50mm] flex-shrink-0 border border-gray-300 rounded-sm overflow-hidden mr-6 flex items-center justify-center bg-gray-100">
          {santriPhotoUrl ? (
            <img src={santriPhotoUrl} alt="Foto Santri" className="w-full h-full object-cover" />
          ) : (
            <User className="h-1/2 w-1/2 text-gray-400" />
          )}
        </div>
        <div className="flex-grow space-y-1">
          <h2 className="text-lg font-semibold mb-2">Data Diri Santri</h2>
          <DetailRow label="No. Pendaftaran" value={calonSantri.registration_number} />
          <DetailRow label="Tanggal Daftar" value={formattedRegistrationDate} />
          <DetailRow label="Nama Lengkap" value={fullNameSantri} />
          <DetailRow label="NISN" value={calonSantri.nisn || '-'} />
          <DetailRow label="NIK" value={calonSantri.nik} />
          <DetailRow label="Jenis Kelamin" value={genderSantri} />
          <DetailRow label="Tempat, Tgl Lahir" value={`${calonSantri.born_in}, ${formattedBornAt}`} />
          <DetailRow label="Alamat" value={calonSantri.address} />
          <DetailRow label="Kode Pos" value={calonSantri.postal_code || '-'} />
          <DetailRow label="Telepon" value={calonSantri.phone || '-'} />
        </div>
      </div>

      {/* Section 2: Education Information */}
      <div className="mb-6 border-t pt-4">
        <h2 className="text-lg font-semibold mb-2 flex items-center">
          <School className="h-4 w-4 mr-2" /> Informasi Pendidikan Terakhir
        </h2>
        <div className="space-y-1">
          <DetailRow label="Asal Sekolah" value={calonSantri.previous_school} />
          <DetailRow label="Alamat Sekolah" value={calonSantri.previous_school_address || '-'} />
          <DetailRow label="No. Ijazah" value={calonSantri.certificate_number || '-'} />
          <DetailRow label="Jenjang" value={calonSantri.education_level_id || '-'} /> {/* Assuming education_level_id can be mapped to name if needed */}
        </div>
      </div>

      {/* Section 3: Parent Information */}
      {calonSantri.parent && (
        <div className="mb-6 border-t pt-4">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            <Home className="h-4 w-4 mr-2" /> Data Orang Tua/Wali
          </h2>
          <div className="space-y-1">
            <DetailRow label="Nama Lengkap" value={parentFullName} />
            <DetailRow label="Hubungan" value={calonSantri.parent.parent_as} />
            <DetailRow label="NIK" value={calonSantri.parent.nik} />
            <DetailRow label="No. KK" value={calonSantri.parent.kk} />
            <DetailRow label="Jenis Kelamin" value={parentGender} />
            <DetailRow label="Telepon" value={calonSantri.parent.phone || '-'} />
            <DetailRow label="Email" value={calonSantri.parent.email || '-'} />
            <DetailRow label="Pekerjaan" value={calonSantri.parent.occupation || '-'} />
            <DetailRow label="Pendidikan" value={calonSantri.parent.education || '-'} />
            <DetailRow label="Alamat KTP" value={calonSantri.parent.card_address || '-'} />
            <DetailRow label="Alamat Domisili" value={calonSantri.parent.domicile_address || '-'} />
          </div>
        </div>
      )}

      {/* Footer / Signature Area */}
      <div className="mt-10 text-right text-xs">
        <p>Daftar pada: {formattedRegistrationDate}</p>
        <p className="mt-8">(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<dyad-write path="src/pages/manajemen-santri/CalonSantriDetailPage.tsx" description="Mengintegrasikan fitur cetak formulir ke halaman detail calon santri.">
import React, { useRef, useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useReactToPrint } from 'react-to-print';
import RegistrationFormPdf from '@/components/RegistrationFormPdf'; // Import the new component

const BASE_IMAGE_URL = "https://api.smp.barengsaya.com/storage/";

const CalonSantriDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const santriId = Number(id);
  const navigate = useNavigate();

  const { data: apiResponse, isLoading, isError, error } = useGetCalonSantriByIdQuery(santriId);

  const calonSantri = apiResponse?.data;

  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const printComponentRef = useRef<HTMLDivElement>(null);

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/administrasi' },
    { label: 'Pendaftaran Santri Baru', href: '/dashboard/pendaftaran-santri' },
    { label: 'Detail Calon Santri', icon: <User className="h-4 w-4" /> },
  ];

  const reactToPrintHook = useReactToPrint({
    content: () => printComponentRef.current,
    documentTitle: `Formulir-Pendaftaran-Santri-${calonSantri?.registration_number || santriId}`,
    onAfterPrint: () => {
      // Optional: show a success toast or perform other actions after printing
      console.log('Printing finished!');
      setIsPrintDialogOpen(false); // Close the dialog after print
    },
  });

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
    setIsPrintDialogOpen(true);
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
              <CardTitle className="text-2xl font-bold">Detail Calon Santri: {`${calonSantri.first_name} ${calonSantri.last_name || ''}`.toUpperCase()}</CardTitle>
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
                <DetailRow label="Nama Lengkap" value={`${calonSantri.first_name} ${calonSantri.last_name || ''}`.toUpperCase()} />
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
                        <Pencil className="h-24 w-24 text-muted-foreground" />
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="px-4 py-2 text-center border-t">
                    <h3 className="text-xl font-bold w-full mb-0">{`${calonSantri.first_name} ${calonSantri.last_name || ''}`.toUpperCase()}</h3>
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

      {/* Print Preview Dialog */}
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="max-w-[210mm] h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Pratinjau Formulir Pendaftaran</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto">
            {/* The component to be printed */}
            {calonSantri && <RegistrationFormPdf ref={printComponentRef} calonSantri={calonSantri} />}
          </div>
          <DialogFooter className="p-4 border-t">
            <Button variant="outline" onClick={() => setIsPrintDialogOpen(false)}>Batal</Button>
            <Button onClick={reactToPrintHook}>
              <Printer className="mr-2 h-4 w-4" /> Cetak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CalonSantriDetailPage;