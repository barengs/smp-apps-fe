import React, { useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Import Link
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useGetStudentByIdQuery } from '@/store/slices/studentApi';
import * as toast from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Printer, Edit, Users, UserCheck, User, ArrowLeft, UploadCloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import SantriPhotoCard from './SantriPhotoCard';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useReactToPrint } from 'react-to-print';
import SantriCard from './SantriCard';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ActionButton from '@/components/ActionButton';
import SantriViolationTimeline from '@/components/SantriViolationTimeline';
import StudentPhotoUploadDialog from '@/components/StudentPhotoUploadDialog';

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
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);

  if (isNaN(santriId)) {
    toast.showError('ID santri tidak valid.');
    navigate('/dashboard/santri');
    return null;
  }

  const { data: responseData, error, isLoading } = useGetStudentByIdQuery(santriId);

  const cardComponentRef = useRef<HTMLDivElement>(null);

  const reactToPrintHook = useReactToPrint({
    documentTitle: `Kartu-Santri-${responseData?.nis || santriId}`,
    onAfterPrint: () => {
      toast.showSuccess('Proses cetak selesai.');
      setIsPrintDialogOpen(false);
    },
  });

  const handlePrint = () => {
    reactToPrintHook(() => cardComponentRef.current);
  };

  const handleEdit = () => {
    navigate(`/dashboard/santri/${santriId}/edit`);
  };

  const santri = responseData;
  const fullName = santri ? `${santri.first_name} ${santri.last_name || ''}`.trim() : 'Detail Santri';
  const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL as string;

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
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
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
            <div className="xl:col-span-1">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-10 w-1/3" />
                  </div>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !santri) {
    toast.showError('Gagal memuat detail santri atau santri tidak ditemukan.');
    navigate('/dashboard/santri');
    return null;
  }
  
  const getParentLinks = (parentsData: any): React.ReactNode => {
    console.log('getParentLinks: Raw parentsData:', parentsData);

    if (!parentsData || (Array.isArray(parentsData) && parentsData.length === 0) || (typeof parentsData === 'object' && Object.keys(parentsData).length === 0)) {
      console.log('getParentLinks: No parent data or empty parent data detected.');
      return 'Tidak ada data orang tua';
    }

    let parentsArray: any[] = [];

    if (Array.isArray(parentsData)) {
      console.log('getParentLinks: parentsData is an array.');
      parentsArray = parentsData;
    } else if (typeof parentsData === 'object') {
      console.log('getParentLinks: parentsData is an object.');
      if ('user_id' in parentsData && typeof (parentsData as any).user_id === 'string' && 'first_name' in parentsData && typeof (parentsData as any).first_name === 'string') {
        console.log('getParentLinks: Detected single Parent object.');
        parentsArray = [parentsData as any];
      } else {
        console.log('getParentLinks: Attempting to extract Parent from object values.');
        parentsArray = Object.values(parentsData).filter((val): val is any => {
          const isValid = typeof val === 'object' && val !== null && 'user_id' in val && typeof (val as any).user_id === 'string' && 'first_name' in val && typeof (val as any).first_name === 'string';
          if (!isValid) {
            console.log('getParentLinks: Filtered out invalid parent object:', val);
          }
          return isValid;
        });
      }
    } else {
      console.log('getParentLinks: parentsData is neither array nor object, or unexpected type:', typeof parentsData);
      return 'Format data orang tua tidak dikenali';
    }

    console.log('getParentLinks: Processed parentsArray:', parentsArray);

    const links = parentsArray
      .map((p, index) => {
        if ((p as any).user_id) {
          return (
            <React.Fragment key={(p as any).user_id}>
              <Link to={`/dashboard/wali-santri/${(p as any).user_id}`} className="text-blue-600 hover:underline">
                {`${(p as any).first_name} ${(p as any).last_name || ''}`.trim()}
              </Link>
              {index < parentsArray.length - 1 && ', '}
            </React.Fragment>
          );
        }
        console.log('getParentLinks: Skipping parent due to invalid user_id or missing first_name:', p);
        return null;
      })
      .filter(Boolean) as React.ReactNode[];

    if (links.length > 0) {
      console.log('getParentLinks: Links generated successfully.');
      return links;
    } else {
      console.log('getParentLinks: No valid links generated from parentsArray.');
      return 'Format data orang tua tidak dikenali';
    }
  };

  return (
    <>
      <DashboardLayout title="Detail Santri" role="administrasi">
        <div className="container mx-auto pb-4 px-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-2/3">
              <Card className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Informasi Santri</CardTitle>
                      <CardDescription>Detail lengkap mengenai santri ini.</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ActionButton variant="outline" onClick={() => navigate('/dashboard/santri')} icon={<ArrowLeft className="h-4 w-4" />}>
                        Kembali
                      </ActionButton>
                      <ActionButton variant="warning" onClick={handleEdit} icon={<Edit className="h-4 w-4" />}>
                        Edit
                      </ActionButton>
                      <ActionButton variant="info" onClick={() => setIsPrintDialogOpen(true)} icon={<Printer className="h-4 w-4" />}>
                        Cetak Kartu
                      </ActionButton>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-1 flex flex-col items-center text-center">
                    <div className="w-full max-w-[240px]">
                      <SantriPhotoCard photoUrl={santri.photo || null} name={fullName} />
                    </div>
                    <div className="w-full max-w-[240px] mt-3">
                      <Button variant="outline" className="w-full" onClick={() => setIsPhotoDialogOpen(true)}>
                        <UploadCloud className="mr-2 h-4 w-4" /> Ubah Foto
                      </Button>
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
                    <DetailRow label="Tempat Lahir" value={santri.born_in || '-'} />
                    <DetailRow label="Tanggal Lahir" value={santri.born_at ? new Date(santri.born_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'} />
                    <DetailRow label="Telepon" value={santri.phone || '-'} />
                    <DetailRow label="Alamat" value={santri.address || '-'} />
                    <DetailRow label="Nama Orang Tua" value={getParentLinks(santri.parents)} />
                    <DetailRow label="Tanggal Dibuat" value={new Date(santri.created_at).toLocaleString('id-ID')} />
                    <DetailRow label="Terakhir Diperbarui" value={new Date(santri.updated_at).toLocaleString('id-ID')} />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Tambahan</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="pendidikan" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="pendidikan">Pendidikan</TabsTrigger>
                      <TabsTrigger value="prestasi">Prestasi</TabsTrigger>
                      <TabsTrigger value="pelanggaran">Pelanggaran</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pendidikan" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Riwayat Pendidikan</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">Data riwayat pendidikan akan ditampilkan di sini.</p>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="prestasi" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Riwayat Prestasi</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">Data prestasi akan ditampilkan di sini.</p>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="pelanggaran" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Riwayat Pelanggaran</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <SantriViolationTimeline studentId={santri.id} />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>

      <StudentPhotoUploadDialog
        open={isPhotoDialogOpen}
        onOpenChange={setIsPhotoDialogOpen}
        studentId={santri.id}
        currentPhotoUrl={santri.photo ? `${STORAGE_BASE_URL}${santri.photo}` : undefined}
        onUploaded={() => { /* refetch handled by RTK Query invalidation */ }}
      />

      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="sm:max-w-fit p-8 bg-gray-100">
          <DialogHeader>
            <DialogTitle>Pratinjau Kartu Santri</DialogTitle>
          </DialogHeader>
          <div className="my-4 flex justify-center">
            <SantriCard
              ref={cardComponentRef}
              santri={{
                id: santri.id,
                first_name: santri.first_name,
                last_name: santri.last_name || '',
                nis: santri.nis,
                photo: santri.photo || null,
                gender: santri.gender,
                program: santri.program,
              } as any}
            />
          </div>
          <DialogFooter>
            <ActionButton variant="outline" onClick={() => setIsPrintDialogOpen(false)}>Batal</ActionButton>
            <ActionButton onClick={handlePrint} variant="success" icon={<Printer className="h-4 w-4" />}>
              Cetak
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SantriDetailPage;