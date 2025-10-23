import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useGetCalonSantriByIdQuery, useProcessRegistrationPaymentMutation } from '@/store/slices/calonSantriApi'; // Import new mutation
import { User, Pencil, ArrowLeft, Printer, DollarSign, Download } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetProdukBankQuery } from '@/store/slices/produkBankApi';
import { useGetTransactionTypesQuery } from '@/store/slices/transactionTypeApi';

const BASE_IMAGE_URL = import.meta.env.VITE_STORAGE_BASE_URL;

const CalonSantriDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const santriId = Number(id);
  const navigate = useNavigate();

  const { data: apiResponse, isLoading, isError, error } = useGetCalonSantriByIdQuery(santriId);
  const calonSantri = apiResponse?.data;

  const [processPayment, { isLoading: isProcessingPayment }] = useProcessRegistrationPaymentMutation(); // New mutation hook

  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [isPaymentProcessDialogOpen, setIsPaymentProcessDialogOpen] = useState(false); // State baru untuk dialog pembayaran
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
  const [selectedTransactionTypeId, setSelectedTransactionTypeId] = useState<string | undefined>(undefined);

  const { data: produkBankData, isLoading: isLoadingProdukBank } = useGetProdukBankQuery({});
  const { data: transactionTypesData, isLoading: isLoadingTransactionTypes } = useGetTransactionTypesQuery({});

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
          <div className="text-red-500">Terjadi kesalahan saat memuat detail data.</div>
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

  const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-2 gap-x-4 py-1">
      <span className="font-medium text-gray-600">{label}</span>
      <span>: {value || '-'}</span>
    </div>
  );

  const calonSantriPhotoUrl = calonSantri.photo ? `${BASE_IMAGE_URL}${calonSantri.photo}` : null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleProcessPayment = () => {
    setIsPaymentProcessDialogOpen(true); // Buka dialog saat tombol diklik
  };

  const handleContinuePaymentProcess = async () => {
    if (!calonSantri || !selectedProductId || !selectedTransactionTypeId) {
      toast.showError('Harap pilih Produk Tabungan dan Jenis Transaksi.');
      return;
    }

    // Get current Hijri year
    const today = new Date();
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { year: 'numeric' });
    let hijriYear = 0;
    const parts = formatter.formatToParts(today);
    for (const part of parts) {
      if (part.type === 'year') {
        hijriYear = parseInt(part.value);
        break;
      }
    }

    try {
      await processPayment({
        registration_id: calonSantri.id,
        product_id: Number(selectedProductId),
        hijri_year: hijriYear,
        amount: 0, // As per requirement
        transaction_type_id: Number(selectedTransactionTypeId),
        channel: 'TELLER', // As per requirement
        registration_number: calonSantri.registration_number,
      }).unwrap();
      toast.showSuccess('Proses pembayaran registrasi berhasil!');
      setIsPaymentProcessDialogOpen(false); // Tutup dialog setelah berhasil
    } catch (err) {
      console.error('Gagal memproses pembayaran:', err);
      toast.showError('Gagal memproses pembayaran registrasi.');
    }
  };

  const PdfDocument = <RegistrationFormPdf calonSantri={calonSantri} />;
  const pdfFileName = `Formulir Pendaftaran - ${calonSantri.first_name} ${calonSantri.last_name || ''}.pdf`;

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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={handleProcessPayment} 
                      size="icon" 
                      disabled={isProcessingPayment || calonSantri.payment_status === 'paid' || calonSantri.payment_amount > 0} // Disable if already paid or amount > 0
                    >
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

      {/* Dialog Proses Pembayaran */}
      <Dialog open={isPaymentProcessDialogOpen} onOpenChange={setIsPaymentProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-12 w-12 text-yellow-500" /> {/* Ikon peringatan diperbesar */}
              Proses Pembayaran
            </DialogTitle>
            <DialogDescription>
              Pilih produk tabungan dan jenis transaksi untuk membuat akun santri dan memproses pembayaran.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="produk-tabungan" className="text-right">
                Produk Tabungan
              </label>
              <Select
                value={selectedProductId}
                onValueChange={setSelectedProductId}
                disabled={isLoadingProdukBank || isProcessingPayment}
              >
                <SelectTrigger id="produk-tabungan" className="col-span-3">
                  <SelectValue placeholder={isLoadingProdukBank ? "Memuat produk..." : "Pilih produk tabungan"} />
                </SelectTrigger>
                <SelectContent>
                  {produkBankData?.map((produk) => (
                    <SelectItem key={produk.id} value={String(produk.id)}>
                      {produk.product_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="jenis-transaksi" className="text-right">
                Jenis Transaksi
              </label>
              <Select
                value={selectedTransactionTypeId}
                onValueChange={setSelectedTransactionTypeId}
                disabled={isLoadingTransactionTypes || isProcessingPayment}
              >
                <SelectTrigger id="jenis-transaksi" className="col-span-3">
                  <SelectValue placeholder={isLoadingTransactionTypes ? "Memuat jenis transaksi..." : "Pilih jenis transaksi"} />
                </SelectTrigger>
                <SelectContent>
                  {transactionTypesData?.data.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isProcessingPayment}>
                Batal
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleContinuePaymentProcess} disabled={isProcessingPayment || !selectedProductId || !selectedTransactionTypeId}>
              {isProcessingPayment ? 'Memproses...' : 'Lanjutkan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CalonSantriDetailPage;