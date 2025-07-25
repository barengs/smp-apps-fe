import React, { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useGetStudentByIdQuery } from '@/store/slices/studentApi';
import * as toast from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Printer, Edit, Users, UserCheck, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import SantriPhotoCard from './SantriPhotoCard';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useReactToPrint } from 'react-to-print';
import SantriCard from './SantriCard';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { ArrowLeft } from 'lucide-react';

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
    toast.showError('ID santri tidak valid.');
    navigate('/dashboard/santri');
    return null;
  }

  const { data: responseData, error, isLoading } = useGetStudentByIdQuery(santriId);

  const cardComponentRef = useRef<HTMLDivElement>(null);

  const reactToPrintHook = useReactToPrint({
    documentTitle: `Kartu-Santri-${responseData?.data.nis || santriId}`,
    onAfterPrint: () => {
      toast.showSuccess('Proses cetak selesai.');
      setIsPrintDialogOpen(false);
    },
  });

  const handlePrint = () => {
    reactToPrintHook(() => cardComponentRef.current);
  };

  const handleEdit = () => {
    toast.showWarning('Fitur edit santri akan segera tersedia.');
  };

  const santri = responseData?.data;
  const fullName = santri ? `${santri.first_name} ${santri.last_name || ''}`.trim() : 'Detail Santri';

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Santri', href: '/dashboard/santri', icon: <Users className="h-4 w-4" /> },
    { label: 'Daftar Santri', href: '/dashboard/santri', icon: <UserCheck className="h-4 w-4" /> },
    { label: fullName, icon: <User className="h-4 w-4" /> },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Detail Santri" role="administrasi">
        <div className="container mx-auto py-4 px-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 flex flex-col items-center">
                <Skeleton className="aspect-[3/4] w-full max-w-[240px] rounded-lg" />
                <Skeleton className="h-6 w-3/4 mt-4" />
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

  if (error || !santri) {
    toast.showError('Gagal memuat detail santri atau santri tidak ditemukan.');
    navigate('/dashboard/santri');
    return null;
  }
  
  const getParentNames = (parentsData: any): string => {
    if (!parentsData || typeof parentsData !== 'object' || Object.keys(parentsData).length === 0) {
      return 'Tidak ada data orang tua';
    }
  
    // Case 1: It's a single parent object directly.
    if (typeof parentsData.first_name === 'string') {
      return `${parentsData.first_name} ${parentsData.last_name || ''}`.trim();
    }
  
    // Case 2: It's an array of parent objects or an object of parent objects.
    const parentsArray = Object.values(parentsData);
    const names = parentsArray
      .map((p: any) => {
        if (p && typeof p === 'object' && typeof p.first_name === 'string') {
          return `${p.first_name} ${p.last_name || ''}`.trim();
        }
        return null;
      })
      .filter(Boolean);
  
    if (names.length > 0) {
      return names.join(', ');
    }
  
    return 'Format data orang tua tidak dikenali';
  };

  const parentsNames = getParentNames(santri.parents);

  return (
    <>
      <DashboardLayout title="Detail Santri" role="administrasi">
        <div className="container mx-auto pb-4 px-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <Card className="w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Informasi Santri</CardTitle>
                  <CardDescription>Detail lengkap mengenai santri ini.</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={() => navigate('/dashboard/santri')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                  </Button>
                  <Button variant="outline" onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button variant="outline" onClick={() => setIsPrintDialogOpen(true)}>
                    <Printer className="mr-2 h-4 w-4" /> Cetak Kartu
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 flex flex-col items-center text-center">
                <div className="w-full max-w-[240px]">
                  <SantriPhotoCard photoUrl={santri.photo} name={fullName} />
                </div>
              </div>
              <div className="lg:col-span-3">
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
              </div>
            </CardContent>
          </Card>
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
              <Printer className="mr-2 h-4 w-4" /> Cetak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SantriDetailPage;