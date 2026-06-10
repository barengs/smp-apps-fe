import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useGetEmployeeByIdQuery, useUpdateEmployeeMutation } from '@/store/slices/employeeApi';
import * as toast from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { User, Briefcase, UsersRound, ArrowLeft, Edit, Camera, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { useReactToPrint } from 'react-to-print';
import { useGetStudentCardSettingsQuery } from '@/store/slices/studentCardApi';
import StaffCard from './StaffCard';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Printer, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL as string | undefined;

const buildPhotoUrl = (photo?: string | null): string | null => {
  if (!photo) return null;
  const src = String(photo).trim();

  if (src.startsWith('data:') || /^https?:\/\//.test(src)) return src;

  if (src.startsWith('/storage/')) {
    return `${window.location.origin}${src}`;
  }

  if (src.startsWith('uploads/')) {
    const base = STORAGE_BASE_URL || `${window.location.origin}/storage/`;
    const safeBase = base.endsWith('/') ? base : `${base}/`;
    return `${safeBase}${src}`;
  }

  const base = STORAGE_BASE_URL || `${window.location.origin}/storage/`;
  const safeBase = base.endsWith('/') ? base : `${base}/`;
  return `${safeBase}uploads/logos/large/${src}`;
};

const DetailRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 py-2 border-b last:border-b-0">
    <span className="font-semibold text-gray-700">{label}:</span>
    <div className="text-gray-900 break-words">{value || '-'}</div>
  </div>
);

const StaffDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const staffId = parseInt(id || '', 10);

  useEffect(() => {
    if (isNaN(staffId)) {
      toast.showError('ID staf tidak valid.');
      navigate('/dashboard/staf');
    }
  }, [staffId, navigate]);

  const { data: responseData, error, isLoading } = useGetEmployeeByIdQuery(staffId, {
    skip: isNaN(staffId),
  });

  useEffect(() => {
    if (error || (responseData && !responseData.data)) {
      toast.showError('Gagal memuat detail staf atau staf tidak ditemukan.');
      navigate('/dashboard/staf');
    }
  }, [error, responseData, navigate]);

  const staffData = responseData?.data;
  const fullName = staffData ? `${staffData.first_name || ''} ${staffData.last_name || ''}`.trim() : 'Detail Staf';

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Staf', href: '/dashboard/staf', icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Daftar Staf', href: '/dashboard/staf', icon: <UsersRound className="h-4 w-4" /> },
    { label: fullName, icon: <User className="h-4 w-4" /> },
  ];

  const handleEdit = () => {
    navigate(`/dashboard/staf/${staffId}/edit`);
  };

  const [updateEmployee, { isLoading: isUpdatingPhoto }] = useUpdateEmployeeMutation();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    if (isUpdatingPhoto) return;
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.showError('File harus berupa gambar.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.showError('Ukuran file maksimal 2 MB.');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
      await updateEmployee({ id: staffId, data: formData }).unwrap();
      toast.showSuccess('Foto profil berhasil diperbarui.');
    } catch (err: any) {
      console.error(err);
      toast.showError('Gagal memperbarui foto profil.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Printing logic
  const [isPrintDialogOpen, setIsPrintDialogOpen] = React.useState(false);
  const [selectedCardSide, setSelectedCardSide] = React.useState<'front' | 'back'>('front');
  const cardComponentRef = React.useRef<HTMLDivElement>(null);
  const { data: settingsResponse } = useGetStudentCardSettingsQuery();

  const handlePrint = useReactToPrint({
    contentRef: cardComponentRef,
    documentTitle: `Kartu-Staf-${staffData?.code || staffId}-${selectedCardSide}`,
    pageStyle: `@page { size: auto; margin: 0mm; } @media print { body { -webkit-print-color-adjust: exact; } }`,
    onAfterPrint: () => {
      toast.showSuccess('Proses cetak selesai.');
      setIsPrintDialogOpen(false);
    },
  });

  const triggerPrintFront = () => {
    setSelectedCardSide('front');
    setTimeout(() => handlePrint(), 100);
  };

  const triggerPrintBack = () => {
    setSelectedCardSide('back');
    setTimeout(() => handlePrint(), 100);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Detail Staf" role="administrasi">
        <div className="container mx-auto py-4 px-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 flex flex-col items-center">
                <Skeleton className="aspect-[3/4] w-full max-w-[240px] rounded-lg" />
                <Skeleton className="h-6 w-3/4 mt-4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
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

  if (isNaN(staffId)) {
    return null;
  }

  if (!staffData) {
    return null;
  }

  const roles = staffData.user?.roles || [];
  const photoUrl = buildPhotoUrl(staffData.photo);

  return (
    <DashboardLayout title="Detail Staf" role="administrasi">
      <div className="container mx-auto pb-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Informasi Staf</CardTitle>
                <CardDescription>Detail lengkap mengenai staf ini.</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => setIsPrintDialogOpen(true)}>
                  <Printer className="mr-2 h-4 w-4" /> Cetak Kartu
                </Button>
                <Button variant="outline" onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 flex flex-col items-center text-center">
              <div 
                onClick={handlePhotoClick}
                className="group relative aspect-[3/4] w-full max-w-[240px] bg-muted rounded-lg flex items-center justify-center overflow-hidden border cursor-pointer transition-all hover:border-primary"
              >
                {photoUrl ? (
                  <img src={photoUrl} alt={`Foto ${fullName}`} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-24 w-24 text-muted-foreground" />
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Camera className="h-8 w-8 mb-1" />
                  <span className="text-xs font-semibold">Ubah Foto</span>
                </div>

                {/* Loading overlay */}
                {isUpdatingPhoto && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-10">
                    <Loader2 className="h-8 w-8 animate-spin mb-1" />
                    <span className="text-xs font-semibold">Mengunggah...</span>
                  </div>
                )}
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
              />

              <h3 className="mt-4 text-xl font-bold">{fullName}</h3>
              <p className="text-sm text-muted-foreground">{staffData.email || '-'}</p>
            </div>
            <div className="lg:col-span-3">
              <DetailRow label="Nama Depan" value={staffData.first_name} />
              <DetailRow label="Nama Belakang" value={staffData.last_name} />
              <DetailRow label="Email" value={staffData.email} />
              <DetailRow label="Kode Staf" value={staffData.code} />
              <DetailRow label="NIK" value={staffData.nik} />
              <DetailRow label="Telepon" value={staffData.phone} />
              <DetailRow label="Alamat" value={staffData.address} />
              <DetailRow label="Kode Pos" value={staffData.zip_code} />
              <DetailRow label="Username" value={staffData.user?.name || ''} />
              <DetailRow label="Gender" value={staffData.gender} />
              <DetailRow label="Status" value={staffData.status} />
              <DetailRow label="Peran" value={
                roles && roles.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {roles.map((role, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{role.name}</Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 italic">Tidak ada peran</span>
                )
              } />
              <DetailRow label="Tanggal Dibuat" value={staffData.created_at ? new Date(staffData.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'} />
              <DetailRow label="Terakhir Diperbarui" value={staffData.updated_at ? new Date(staffData.updated_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="max-w-4xl p-8 bg-gray-50">
          <DialogHeader>
            <div className="flex justify-between items-center">
                <div>
                    <DialogTitle>Cetak Kartu Staf</DialogTitle>
                    <DialogDescription>
                        Pratinjau kartu staf sebelum dicetak.
                    </DialogDescription>
                </div>
                <div className="flex bg-gray-200 p-1 rounded-lg">
                    <Button 
                        variant={selectedCardSide === 'front' ? 'secondary' : 'ghost'} 
                        size="sm" 
                        onClick={() => setSelectedCardSide('front')}
                        className="text-xs h-8"
                    >
                        Sisi Depan
                    </Button>
                    <Button 
                        variant={selectedCardSide === 'back' ? 'secondary' : 'ghost'} 
                        size="sm" 
                        onClick={() => setSelectedCardSide('back')}
                        className="text-xs h-8"
                    >
                        Sisi Belakang
                    </Button>
                </div>
            </div>
          </DialogHeader>
          <div className="my-6 flex flex-col items-center min-h-[300px] justify-center">
            <StaffCard 
              data={{
                first_name: staffData.first_name,
                last_name: staffData.last_name,
                nik: staffData.nik,
                nip: staffData.nip,
                address: staffData.address,
                phone: staffData.phone,
                photo: photoUrl,
                birth_place: staffData.birth_place,
                birth_date: staffData.birth_date,
              }}
              side={selectedCardSide}
            />
          </div>
          <DialogFooter>
            <div className="flex w-full justify-end items-center gap-2">
              <Button variant="outline" onClick={() => setIsPrintDialogOpen(false)}>Tutup</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="success">
                    <Printer className="mr-2 h-4 w-4" /> Cetak Kartu <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={triggerPrintFront}>
                    <Printer className="mr-2 h-4 w-4" /> Cetak Sisi Depan
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={triggerPrintBack}>
                    <Printer className="mr-2 h-4 w-4" /> Cetak Sisi Belakang
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div ref={cardComponentRef}>
          <StaffCard 
            data={{
              first_name: staffData.first_name,
              last_name: staffData.last_name,
              nik: staffData.nik,
              nip: staffData.nip,
              address: staffData.address,
              phone: staffData.phone,
              photo: photoUrl,
              birth_place: staffData.birth_place,
              birth_date: staffData.birth_date,
            }}
            side={selectedCardSide}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffDetailPage;