import React, { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useGetStudentByIdQuery } from '@/store/slices/studentApi';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import SantriPhotoCard from './SantriPhotoCard';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useReactToPrint } from 'react-to-print';
import SantriCard from './SantriCard';

const DetailRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 py-2 border-b last:border-b-0">
    <span className="font-semibold text-gray-700">{label}:</span>
    <span className="text-gray-900">{value || '-'}</span>
  </div>
);

const SantriDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const santriId = parseInt(id || '', 10);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

  if (isNaN(santriId)) {
    toast.error('ID santri tidak valid.');
    return (
      <DashboardLayout title="Detail Santri" role="administrasi">
        <div className="container mx-auto py-4 px-4">
          <p className="text-red-500">ID santri tidak valid.</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const { data: responseData, error, isLoading } = useGetStudentByIdQuery(santriId);

  const cardComponentRef = useRef<HTMLDivElement>(null);

  const reactToPrintHook = useReactToPrint({
    documentTitle: `Kartu-Santri-${responseData?.data.nis || santriId}`,
    onAfterPrint: () => {
      toast.success('Proses cetak selesai.');
      setIsPrintDialogOpen(false);
    },
  });

  const handlePrint = () => {
    reactToPrintHook(() => cardComponentRef.current);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Detail Santri" role="administrasi">
        <div className="container mx-auto py-4 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <Skeleton className="h-40 w-40 rounded-full mb-4" />
                  <Skeleton className="h-6 w-3/4" />
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-[150px_1fr] items-center gap-x-4">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !responseData?.data) {
    const errorMessage = 'Gagal memuat detail santri atau santri tidak ditemukan.';
    toast.error(errorMessage);
    return (
      <DashboardLayout title="Detail Santri" role="administrasi">
        <div className="container mx-auto py-4 px-4">
          <p className="text-red-500">{errorMessage}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const santri = responseData.data;
  const fullName = `${santri.first_name} ${santri.last_name || ''}`.trim();
  const parentsNames = santri.parents?.map(parent => 
    `${parent.first_name} ${parent.last_name || ''}`.trim()
  ).join(', ');

  return (
    <>
      <DashboardLayout title="Detail Santri" role="administrasi">
        <div className="container mx-auto pb-4 px-4">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-3xl font-bold">Detail Santri</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1">
              <div className="max-w-[240px] mx-auto lg:mx-0">
                <SantriPhotoCard photoUrl={santri.photo} name={fullName} />
              </div>
            </div>
            <div className="lg:col-span-3">
              <Card className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Informasi Pribadi</CardTitle>
                      <CardDescription>Detail lengkap mengenai santri ini.</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setIsPrintDialogOpen(true)}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Cetak Kartu
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <DetailRow label="Nama Lengkap" value={fullName} />
                  <DetailRow label="NIS" value={santri.nis} />
                  <DetailRow label="NIK" value={santri.nik} />
                  <DetailRow label="Jenis Kelamin" value={santri.gender === 'L' ? 'Laki-Laki' : 'Perempuan'} />
                  <DetailRow label="Status" value={<Badge variant="outline">{santri.status}</Badge>} />
                  <DetailRow label="Program" value={santri.program?.name} />
                  <DetailRow label="Periode" value={santri.period} />
                  <DetailRow label="Tempat Lahir" value={santri.born_in} />
                  <DetailRow label="Tanggal Lahir" value={santri.born_at ? new Date(santri.born_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'} />
                  <DetailRow label="Telepon" value={santri.phone} />
                  <DetailRow label="Alamat" value={santri.address} />
                  <DetailRow label="Nama Orang Tua" value={parentsNames} />
                  <DetailRow label="Tanggal Dibuat" value={new Date(santri.created_at).toLocaleString('id-ID')} />
                  <DetailRow label="Terakhir Diperbarui" value={new Date(santri.updated_at).toLocaleString('id-ID')} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>

      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="sm:max-w-fit p-8 bg-gray-100">
          <DialogHeader>
            <DialogTitle>Pratinjau Kartu Santri</DialogTitle>
          </DialogHeader>
          <div className="my-4 flex justify-center">
            <SantriCard ref={cardComponentRef} santri={santri} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPrintDialogOpen(false)}>Batal</Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Cetak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SantriDetailPage;