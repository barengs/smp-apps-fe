import React, { useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useGetStudentByIdQuery } from '@/store/slices/studentApi';
import * as toast from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Printer, Edit, Users, UserCheck, User, ArrowLeft, UploadCloud, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import SantriPhotoCard from './SantriPhotoCard';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ActionButton from '@/components/ActionButton';
import SantriViolationTimeline from '@/components/SantriViolationTimeline';
import StudentPhotoUploadDialog from '@/components/StudentPhotoUploadDialog';
import { useReactToPrint } from 'react-to-print';
import { 
  useGetStudentCardQuery, 
  useCreateStudentCardMutation, 
  useGetStudentCardSettingsQuery,
  useDeactivateStudentCardMutation
} from '@/store/slices/studentCardApi';
import DebitStudentCard from './DebitStudentCard';

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

  // Queries
  const { data: responseData, error, isLoading } = useGetStudentByIdQuery(santriId, { skip: isNaN(santriId) });
  
  // Student Card Logic
  const santri = responseData;
  const skipCardQuery = !santri?.nis;
  const { 
    data: cardResponse, 
    isLoading: isCardLoading, 
    refetch: refetchCard 
  } = useGetStudentCardQuery(santri?.nis || '', { skip: skipCardQuery });
  
  const { data: settingsResponse } = useGetStudentCardSettingsQuery();
  const [createCard, { isLoading: isCreatingCard }] = useCreateStudentCardMutation();
  const [deactivateCard, { isLoading: isDeactivatingCard }] = useDeactivateStudentCardMutation();

  const cardComponentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => cardComponentRef.current,
    documentTitle: `Kartu-Santri-${responseData?.nis || santriId}`,
    pageStyle: `@page { size: auto; margin: 0mm; } @media print { body { -webkit-print-color-adjust: exact; } }`,
    onAfterPrint: () => {
      toast.showSuccess('Proses cetak selesai.');
      setIsPrintDialogOpen(false);
    },
  } as any);

  const handleCreateCard = async () => {
    try {
      await createCard(santriId).unwrap();
      toast.showSuccess('Kartu santri berhasil dibuat.');
      refetchCard();
    } catch (err: any) {
      toast.showError(err?.data?.message || 'Gagal membuat kartu santri.')
    }
  };

  const handleDeactivateCard = async () => {
    if (!cardResponse?.data?.card?.id) return;
    if (!confirm('Apakah anda yakin ingin menonaktifkan kartu ini?')) return;
    
    try {
      await deactivateCard(cardResponse.data.card.id).unwrap();
      toast.showSuccess('Kartu santri berhasil dinonaktifkan.');
      refetchCard();
    } catch (err: any) {
      toast.showError(err?.data?.message || 'Gagal menonaktifkan kartu santri.');
    }
  };

  if (isNaN(santriId)) {
    navigate('/dashboard/santri');
    return null;
  }

  const handleEdit = () => {
    navigate(`/dashboard/santri/${santriId}/edit`);
  };

  const fullName = santri ? `${santri.first_name} ${santri.last_name || ''}`.trim() : 'Detail Santri';
  const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL as string;

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Santri', href: '/dashboard/santri', icon: <Users className="h-4 w-4" /> },
    { label: 'Daftar Santri', href: '/dashboard/santri', icon: <UserCheck className="h-4 w-4" /> },
    { label: fullName, icon: <User className="h-4 w-4" /> },
  ];

  const getParentLinks = (parentsData: any): React.ReactNode => {
     if (!parentsData) return 'Tidak ada data orang tua';
     const parentsArray = Array.isArray(parentsData) ? parentsData : [parentsData];
     
     const links = parentsArray
       .filter((p: any) => p && p.user_id)
       .map((p: any, index: number) => (
         <React.Fragment key={p.user_id}>
           <Link to={`/dashboard/wali-santri/${p.user_id}`} className="text-blue-600 hover:underline">
             {`${p.first_name} ${p.last_name || ''}`.trim()}
           </Link>
           {index < parentsArray.length - 1 && ', '}
         </React.Fragment>
       ));

      return links.length > 0 ? links : 'Format data orang tua tidak dikenali';
  };

  return (
    <>
      <DashboardLayout title="Detail Santri" role="administrasi">
        {isLoading ? (
             <div className="container mx-auto py-4 px-4"><Skeleton className="h-96 w-full" /></div>
        ) : (!santri ? (
             <div className="p-4 text-center">Santri tidak ditemukan</div>
        ) : (
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
                  <CardHeader><CardTitle>Informasi Tambahan</CardTitle></CardHeader>
                  <CardContent>
                    <Tabs defaultValue="pendidikan">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pendidikan">Pendidikan</TabsTrigger>
                        <TabsTrigger value="prestasi">Prestasi</TabsTrigger>
                        <TabsTrigger value="pelanggaran">Pelanggaran</TabsTrigger>
                      </TabsList>
                       <TabsContent value="pelanggaran" className="mt-4"><SantriViolationTimeline studentId={santri.id} /></TabsContent>
                       <TabsContent value="pendidikan" className="mt-4"><p className="text-sm text-gray-500">Data pendidikan.</p></TabsContent>
                       <TabsContent value="prestasi" className="mt-4"><p className="text-sm text-gray-500">Data prestasi.</p></TabsContent>
                    </Tabs>
                  </CardContent>
                 </Card>
              </div>
            </div>
          </div>
        ))}
      </DashboardLayout>

      <StudentPhotoUploadDialog
        open={isPhotoDialogOpen}
        onOpenChange={setIsPhotoDialogOpen}
        studentId={santriId}
        currentPhotoUrl={santri?.photo ? `${STORAGE_BASE_URL}${santri.photo}` : undefined}
      />

      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="max-w-4xl p-8 bg-gray-50">
          <DialogHeader>
            <DialogTitle>Cetak Kartu Santri</DialogTitle>
            <DialogDescription>
              Pratinjau kartu santri sebelum dicetak. Pastikan data sudah benar.
            </DialogDescription>
          </DialogHeader>
          <div className="my-6 flex flex-col items-center min-h-[300px] justify-center">
            {isCardLoading ? (
               <Skeleton className="w-[85.6mm] h-[53.98mm]" />
            ) : (!cardResponse?.data ? (
               <div className="text-center space-y-4">
                 <div className="text-red-500 font-medium">Santri ini belum memiliki kartu (Data kartu tidak ditemukan).</div>
                 <Button onClick={handleCreateCard} disabled={isCreatingCard} variant="primary">
                   {isCreatingCard ? 'Membuat...' : 'Buat Kartu Santri Sekarang'}
                 </Button>
               </div>
            ) : (
               <>
               <DebitStudentCard 
                  student={{
                    name: cardResponse.data.student_details.name,
                    nis: santri?.nis || '-',
                    birth_place: cardResponse.data.student_details.birth_place,
                    birth_date: cardResponse.data.student_details.birth_date,
                    address: cardResponse.data.student_details.address,
                    village: cardResponse.data.student_details.village,
                    photo: santri?.photo || null,
                  }}
                  cardData={{
                    card_number: cardResponse.data.card.card_number,
                  }}
                  templates={{
                    front: settingsResponse?.data?.front_template || null,
                    back: settingsResponse?.data?.back_template || null,
                    stamp: settingsResponse?.data?.stamp || null,
                    signature: settingsResponse?.data?.signature || null,
                  }}
               />
               {cardResponse.data.card.is_active === false && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center w-full max-w-md">
                     <p className="text-red-600 font-semibold mb-1">Status Kartu: Tidak Aktif</p>
                    <p className="text-xs text-red-500">Kartu ini telah dinonaktifkan. Silakan buat kartu baru jika diperlukan.</p>
                  </div>
               )}
               </>
            ))}
          </div>
          <DialogFooter>
             <div className="flex w-full justify-between items-center">
                <div>
                   {cardResponse?.data && (
                      cardResponse.data.card.is_active ? (
                        <Button variant="danger" onClick={handleDeactivateCard} disabled={isDeactivatingCard}>
                          {isDeactivatingCard ? 'Memproses...' : 'Nonaktifkan Kartu'}
                        </Button>
                      ) : (
                        <Button onClick={handleCreateCard} disabled={isCreatingCard} variant="primary">
                          {isCreatingCard ? 'Membuat...' : 'Buat Kartu Baru'}
                        </Button>
                      )
                   )}
                </div>
                <div className="flex gap-2">
                   <Button variant="outline" onClick={() => setIsPrintDialogOpen(false)}>Tutup</Button>
                   {cardResponse?.data && (
                      <Button onClick={handlePrint} variant="success" disabled={!cardResponse.data.card.is_active}>
                        <Printer className="mr-2 h-4 w-4" /> Cetak Kartu
                      </Button>
                   )}
                </div>
             </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Hidden for Print */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
         {cardResponse?.data && (
            <div ref={cardComponentRef}>
               <DebitStudentCard 
                  student={{
                    name: cardResponse.data.student_details.name,
                    nis: santri?.nis || '-',
                    birth_place: cardResponse.data.student_details.birth_place,
                    birth_date: cardResponse.data.student_details.birth_date,
                    address: cardResponse.data.student_details.address,
                    village: cardResponse.data.student_details.village,
                    photo: santri?.photo || null,
                  }}
                  cardData={{
                    card_number: cardResponse.data.card.card_number,
                  }}
                  templates={{
                    front: settingsResponse?.data?.front_template || null,
                    back: settingsResponse?.data?.back_template || null,
                    stamp: settingsResponse?.data?.stamp || null,
                    signature: settingsResponse?.data?.signature || null,
                  }}
               />
            </div>
         )}
      </div>
    </>
  );
};

export default SantriDetailPage;