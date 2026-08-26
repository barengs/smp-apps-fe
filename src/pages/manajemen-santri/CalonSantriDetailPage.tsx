import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import WaliSantriLayout from '@/layouts/WaliSantriLayout';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useGetCalonSantriByIdQuery } from '@/store/slices/calonSantriApi'; // Import new mutation
import { User, Pencil, ArrowLeft, Printer, Download } from 'lucide-react';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import RegistrationFormPdf from '@/components/RegistrationFormPdf';
import { AlertCircle } from 'lucide-react'; // Import AlertCircle
import * as toast from '@/utils/toast'; // Import toast utilities
import { formatCurrency } from '@/utils/formatCurrency';
import { getRegistrationStatusLabel, getPaymentStatusLabel } from '@/utils/statusMapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetProgramsQuery } from '@/store/slices/programApi';
import { useGetEducationLevelsQuery } from '@/store/slices/educationApi';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

const BASE_IMAGE_URL = import.meta.env.VITE_STORAGE_BASE_URL;

const CalonSantriDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const santriId = Number(id);
  const navigate = useNavigate();

  const currentUser = useSelector(selectCurrentUser);
  const isOrangTua = currentUser?.roles?.some((r: any) => r.name === 'orangtua');
  const Layout = isOrangTua ? WaliSantriLayout : DashboardLayout;
  const layoutRole = isOrangTua ? 'wali-santri' : 'administrasi';

  const { data: apiResponse, isLoading, isError, error } = useGetCalonSantriByIdQuery(santriId);
  const calonSantri = apiResponse?.data;

  // NEW: state untuk QR data URL
  const [qrDataUrl, setQrDataUrl] = useState<string | undefined>(undefined);

  // NEW: generate QR saat nomor pendaftaran tersedia
  React.useEffect(() => {
    const regNum = calonSantri?.registration_number != null ? String(calonSantri.registration_number).trim() : '';
    if (!regNum) {
      setQrDataUrl(undefined);
      return;
    }
    let isMounted = true;
    (async () => {
      const { default: QRCode } = await import('qrcode');
      const url = await QRCode.toDataURL(regNum, { errorCorrectionLevel: 'H', margin: 0, scale: 4 });
      if (isMounted) setQrDataUrl(url);
    })();
    return () => { isMounted = false; };
  }, [calonSantri?.registration_number]);

  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  const { data: programsResp } = useGetProgramsQuery({});
  const { data: educationLevels } = useGetEducationLevelsQuery({});

  const programMap = React.useMemo(() => {
    const map = new Map<number, string>();
    (programsResp?.data ?? []).forEach((p) => map.set(p.id, p.name));
    return map;
  }, [programsResp]);

  const educationLevelMap = React.useMemo(() => {
    const map = new Map<number, string>();
    (educationLevels ?? []).forEach((level) => map.set(level.id, level.name));
    return map;
  }, [educationLevels]);



  const breadcrumbItems: BreadcrumbItemData[] = isOrangTua
    ? [
        { label: 'Dashboard', href: '/dashboard/wali-santri' },
        { label: 'Pendaftaran Santri Baru', href: '/dashboard/wali-santri/pendaftaran-santri' },
        { label: 'Detail Calon Santri', icon: <User className="h-4 w-4" /> },
      ]
    : [
        { label: 'Dashboard', href: '/dashboard/administrasi' },
        { label: 'Pendaftaran Santri Baru', href: '/dashboard/pendaftaran-santri' },
        { label: 'Detail Calon Santri', icon: <User className="h-4 w-4" /> },
      ];

  if (isLoading) {
    return (
      <Layout title="Detail Calon Santri" role={layoutRole as any}>
        <div className="container mx-auto px-4 pb-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <TableLoadingSkeleton />
        </div>
      </Layout>
    );
  }

  if (isError) {
    console.error("Error fetching calon santri detail:", error);
    return (
      <Layout title="Detail Calon Santri" role={layoutRole as any}>
        <div className="container mx-auto px-4 pb-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <div className="text-red-500">Terjadi kesalahan saat memuat detail data.</div>
        </div>
      </Layout>
    );
  }

  if (!calonSantri) {
    return (
      <Layout title="Detail Calon Santri" role={layoutRole as any}>
        <div className="container mx-auto px-4 pb-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <div className="text-gray-500">Data calon santri tidak ditemukan.</div>
        </div>
      </Layout>
    );
  }

  const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-2 gap-x-4 py-2 border-b border-gray-200 last:border-b-0">
      <span className="font-medium text-gray-600">{label}</span>
      <span>: {value || '-'}</span>
    </div>
  );

  const calonSantriPhotoUrl = calonSantri.photo ? `${BASE_IMAGE_URL}${calonSantri.photo}` : null;




  // UPDATED: sertakan qrDataUrl ke dokumen PDF
  const PdfDocument = <RegistrationFormPdf calonSantri={calonSantri} qrDataUrl={qrDataUrl} />;
  const pdfFileName = `Formulir Pendaftaran - ${calonSantri.first_name} ${calonSantri.last_name || ''}.pdf`;

  return (
    <Layout title="Detail Calon Santri" role={layoutRole as any}>
      <div className="container mx-auto px-4 pb-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Detail Calon Santri: {`${calonSantri.first_name} ${calonSantri.last_name || ''}`.toUpperCase()}</CardTitle>
              <CardDescription>Informasi lengkap mengenai calon santri.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(isOrangTua ? '/dashboard/wali-santri/pendaftaran-santri' : '/dashboard/pendaftaran-santri')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => navigate(`/dashboard/pendaftaran-santri/${santriId}/edit`)} size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => setIsPrintPreviewOpen(true)} size="icon" disabled={!calonSantri}>
                      <Printer className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cetak Formulir</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="umum" className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="umum">Informasi Umum</TabsTrigger>
                <TabsTrigger value="pendidikan">Informasi Pendidikan</TabsTrigger>
                <TabsTrigger value="orangtua">Data Orang Tua/Wali</TabsTrigger>
              </TabsList>

              <TabsContent value="umum" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-md border p-2">
                    <DetailRow label="No. Pendaftaran" value={calonSantri.registration_number} />
                    <DetailRow label="Tanggal Daftar" value={new Date(calonSantri.created_at).toLocaleDateString('id-ID')} />
                    <DetailRow label="Status Pendaftaran" value={<Badge>{getRegistrationStatusLabel(calonSantri.status)}</Badge>} />
                    <DetailRow label="Status Pembayaran" value={<Badge>{getPaymentStatusLabel(calonSantri.payment_status)}</Badge>} />
                    <DetailRow label="Jumlah Pembayaran" value={formatCurrency(calonSantri.payment_amount ?? 0)} />
                    <DetailRow label="Nama Lengkap" value={`${calonSantri.first_name} ${calonSantri.last_name || ''}`.toUpperCase()} />
                    <DetailRow label="Jenis Kelamin" value={calonSantri.gender === 'L' ? 'Laki-laki' : 'Perempuan'} />
                    <DetailRow
                      label="Program"
                      value={
                        calonSantri.program_id
                          ? (programMap.get(Number(calonSantri.program_id)) ?? String(calonSantri.program_id))
                          : '-'
                      }
                    />
                    <DetailRow label="Tempat, Tanggal Lahir" value={`${calonSantri.born_in}, ${new Date(calonSantri.born_at).toLocaleDateString('id-ID')}`} />
                    <DetailRow label="Alamat" value={calonSantri.address} />
                    <DetailRow label="Kode Pos" value={calonSantri.postal_code} />
                    <DetailRow label="Telepon" value={calonSantri.phone} />
                  </div>
                  <div>
                    <Card className="mt-0 p-4 w-fit mx-auto">
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
              </TabsContent>

              <TabsContent value="pendidikan" className="mt-4">
                <div className="rounded-md border p-2">
                  <DetailRow label="Asal Sekolah" value={calonSantri.previous_school} />
                  <DetailRow
                    label="Jenjang Pendidikan"
                    value={
                      calonSantri.education_level_id
                        ? (educationLevelMap.get(Number(calonSantri.education_level_id)) ?? String(calonSantri.education_level_id))
                        : '-'
                    }
                  />
                  <DetailRow label="Alamat Sekolah Asal" value={calonSantri.previous_school_address} />
                  <DetailRow label="Nomor Ijazah" value={calonSantri.certificate_number} />

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <h4 className="font-semibold text-gray-700 mb-4">Informasi Madrasah</h4>
                    <DetailRow label="Asal Madrasah" value={calonSantri.previous_madrasah} />
                    <DetailRow
                      label="Jenjang Madrasah"
                      value={
                        calonSantri.madrasah_level_id
                          ? (educationLevelMap.get(Number(calonSantri.madrasah_level_id)) ?? String(calonSantri.madrasah_level_id))
                          : '-'
                      }
                    />
                    <DetailRow label="Alamat Madrasah Asal" value={calonSantri.previous_madrasah_address} />
                    <DetailRow label="Nomor Ijazah Madrasah" value={calonSantri.certificate_madrasah} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="orangtua" className="mt-4">
                {calonSantri.parent ? (
                  <div className="rounded-md border p-2">
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
                        <DetailRow label="Pekerjaan"
                          value={
                            calonSantri.parent.occupation
                              ? (typeof calonSantri.parent.occupation === 'object'
                                  ? (calonSantri.parent.occupation as any).name
                                  : String(calonSantri.parent.occupation))
                              : '-'
                          }
                        />
                        <DetailRow
                          label="Pendidikan"
                          value={
                            calonSantri.parent.education
                              ? (typeof calonSantri.parent.education === 'object'
                                  ? (calonSantri.parent.education as any).name
                                  : String(calonSantri.parent.education))
                              : '-'
                          }
                        />
                        <DetailRow label="Alamat KTP" value={calonSantri.parent.card_address || '-'} />
                        <DetailRow label="Alamat Domisili" value={calonSantri.parent.domicile_address || '-'} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border p-4 text-gray-600">
                    Data orang tua belum tersedia.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isPrintPreviewOpen} onOpenChange={setIsPrintPreviewOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Pratinjau Formulir</DialogTitle>
            <DialogDescription>
              Ini adalah pratinjau dari formulir pendaftaran. Klik 'Unduh' untuk menyimpan sebagai PDF.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow bg-gray-200">
            {typeof window !== 'undefined' && (
              <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                {PdfDocument}
              </PDFViewer>
            )}
          </div>
          <DialogFooter className="p-6 pt-4 border-t">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Tutup
              </Button>
            </DialogClose>
            <PDFDownloadLink document={PdfDocument} fileName={pdfFileName}>
              {({ loading }) => (
                <Button disabled={loading}>
                  <Download className="mr-2 h-4 w-4" />
                  {loading ? 'Membuat PDF...' : 'Unduh'}
                </Button>
              )}
            </PDFDownloadLink>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Layout>
  );
};

export default CalonSantriDetailPage;