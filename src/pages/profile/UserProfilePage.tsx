import React, { useState, useRef } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import WaliSantriLayout from '@/layouts/WaliSantriLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { useGetProfileDetailsQuery, useGetSantriByParentNikQuery } from '@/store/slices/authApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import ProfilePhotoCard from '@/components/ProfilePhotoCard';
import { Button } from '@/components/ui/button';
import { Pencil, Key, User, Printer, CreditCard, UploadCloud } from 'lucide-react';
import ChangePasswordFormModal from '@/components/ChangePasswordFormModal';
import { useNavigate } from 'react-router-dom';
import CustomBreadcrumb, { BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { useReactToPrint } from 'react-to-print';
import WaliSantriCard from '@/pages/manajemen-santri/WaliSantriCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ParentPhotoUploadDialog from '@/components/ParentPhotoUploadDialog';

// Custom type guards for robust error handling
function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error != null && 'status' in error;
}

function isSerializedError(error: unknown): error is SerializedError {
  return typeof error === 'object' && error != null && 'message' in error;
}

const UserProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { data: profileData, isLoading, isError, error } = useGetProfileDetailsQuery();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Profil', icon: <User className="h-4 w-4" /> },
  ];

  // Mengubah handleEditPhoto agar sesuai dengan prop onCapture
  const handleEditPhoto = (imageSrc: string) => {
    console.log("Foto diambil dari kamera:", imageSrc);
    // TODO: Implementasikan logika pengunggahan/pembaruan foto di sini
  };

  const handleEditProfile = () => {
    navigate('/dashboard/profile/edit');
  };

  const handleChangePassword = () => {
    setIsChangePasswordModalOpen(true);
  };

  // Determine if user is Wali Santri
  const isWaliSantri = currentUser?.roles?.some(role => role.name === 'orangtua');

  // State untuk dialog cetak kartu (hanya wali santri)
  const [showCardDialog, setShowCardDialog] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: cardRef });

  // Ambil data santri by NIK profil (untuk wali santri)
  const parentNik = profileData?.data?.profile?.nik ?? '';
  const { data: santriData } = useGetSantriByParentNikQuery(parentNik, {
    skip: !isWaliSantri || !parentNik,
  });
  const parentStudents = santriData?.data?.student ?? [];

  const Layout = isWaliSantri ? WaliSantriLayout : DashboardLayout;
  const layoutProps = isWaliSantri
    ? { title: "Profil Pengguna", role: "wali-santri" as const }
    : { title: "Profil Pengguna", role: "administrasi" as const };

  if (isLoading) {
    return (
      <Layout {...layoutProps}>
        <div className="w-full max-w-4xl mx-auto py-4 px-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <div className="mt-6">
            <Card className="w-full">
              <CardHeader className="flex flex-col items-center space-y-4 py-8 md:flex-row md:items-start md:space-y-0 md:space-x-6 md:justify-between">
                <div className="flex flex-col items-center space-y-4 md:flex-row md:items-start md:space-y-0 md:space-x-6">
                  <Card className="w-36 h-48 flex flex-col items-center justify-center relative overflow-hidden shadow-md">
                    <CardContent className="p-0 w-full h-full flex items-center justify-center">
                      <Skeleton className="w-full h-full rounded-none" />
                    </CardContent>
                  </Card>
                  <div className="space-y-2 text-center md:text-left">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-5 w-48" />
                  </div>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-36" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Skeleton className="h-4 w-1/4 mb-2" /><Skeleton className="h-6 w-full" /></div>
                  <div><Skeleton className="h-4 w-1/4 mb-2" /><Skeleton className="h-6 w-full" /></div>
                  <div><Skeleton className="h-4 w-1/4 mb-2" /><Skeleton className="h-6 w-full" /></div>
                  <div><Skeleton className="h-4 w-1/4 mb-2" /><Skeleton className="h-6 w-full" /></div>
                  <div><Skeleton className="h-4 w-1/4 mb-2" /><Skeleton className="h-6 w-full" /></div>
                  <div><Skeleton className="h-4 w-1/4 mb-2" /><Skeleton className="h-6 w-full" /></div>
                  <div><Skeleton className="h-4 w-1/4 mb-2" /><Skeleton className="h-6 w-full" /></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError) {
    let errorMessage = 'Unknown error';
    if (isFetchBaseQueryError(error)) {
      const fetchError = error;
      if (fetchError.data && typeof fetchError.data === 'object' && 'message' in fetchError.data) {
        errorMessage = (fetchError.data as { message: string }).message;
      } else if (typeof fetchError.status === 'number') {
        errorMessage = `Error ${fetchError.status}`;
      } else {
        errorMessage = `Error: ${JSON.stringify(fetchError)}`;
      }
    } else if (isSerializedError(error)) {
      const serializedError = error;
      errorMessage = serializedError.message || 'Serialized error without message.';
    } else {
      errorMessage = String(error);
    }

    return (
      <Layout {...layoutProps}>
        <div className="w-full max-w-4xl mx-auto py-4 px-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <div className="mt-6">
            <div className="text-red-500 p-4 border border-red-500 rounded-md">
              {t('profilePage.errorLoading')}: {errorMessage}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const profile = profileData?.data?.profile;
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || '-';

  return (
    <Layout {...layoutProps}>
      <div className="w-full max-w-4xl mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <div className="mt-6">
          <Card className="w-full">
            <CardHeader className="flex flex-col items-center space-y-4 py-8 md:flex-row md:items-start md:space-y-0 md:space-x-6 md:justify-between">
              <div className="flex flex-col items-center space-y-4 md:flex-row md:items-start md:space-y-0 md:space-x-6">
                <ProfilePhotoCard
                  photoUrl={profile?.photo}
                  onCapture={handleEditPhoto} // Mengubah onEdit menjadi onCapture
                />
                <div className="text-center md:text-left">
                  <CardTitle className="text-2xl">{fullName}</CardTitle>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <Button variant="warning" onClick={handleEditProfile}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button onClick={handleChangePassword} variant="secondary">
                  <Key className="mr-2 h-4 w-4" /> Ganti Password
                </Button>
                {isWaliSantri && (
                  <Button variant="outline" onClick={() => setShowPhotoDialog(true)}>
                    <UploadCloud className="mr-2 h-4 w-4" /> Ubah Foto
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Kode</p>
                  <p className="text-lg font-semibold">{profile?.code || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
                  <p className="text-lg font-semibold">{fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg font-semibold">{profile?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telepon</p>
                  <p className="text-lg font-semibold">{profile?.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alamat</p>
                  <p className="text-lg font-semibold">{profile?.address || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Kode Pos</p>
                  <p className="text-lg font-semibold">{profile?.zip_code || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* === Section Kartu Identitas (khusus wali santri) === */}
      {isWaliSantri && (
        <div className="w-full max-w-4xl mx-auto px-4 pb-6">
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#01342f]" />
                  Kartu Identitas Wali Santri
                </CardTitle>
                <CardDescription>
                  Cetak kartu identitas Anda sebagai wali santri resmi pesantren.
                </CardDescription>
              </div>
              <Button onClick={() => setShowCardDialog(true)}>
                <Printer className="mr-2 h-4 w-4" /> Cetak Kartu
              </Button>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              {/* Preview kartu (scaled down) */}
              <div
                className="shadow-md rounded overflow-hidden"
                style={{
                  transform: 'scale(1.3)',
                  transformOrigin: 'top center',
                  marginBottom: '3.5rem',
                }}
              >
                <WaliSantriCard
                  data={{
                    photo: profile?.photo ?? null,
                    first_name: profile?.first_name ?? '',
                    last_name: profile?.last_name ?? null,
                    nik: profile?.nik ?? '',
                    parent_as: santriData?.data?.first_name ? 'Wali' : 'Wali',
                    phone: profile?.phone ?? null,
                    students: parentStudents.map((s) => ({
                      nis: s.nis,
                      first_name: s.first_name,
                      last_name: s.last_name ?? null,
                    })),
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dialog Cetak Kartu Wali */}
      {isWaliSantri && (
        <Dialog open={showCardDialog} onOpenChange={setShowCardDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cetak Kartu Identitas Wali Santri</DialogTitle>
              <DialogDescription>
                Pratinjau kartu identitas Anda sebelum dicetak.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <div
                className="shadow-lg rounded-md overflow-hidden"
                style={{ transform: 'scale(1.4)', transformOrigin: 'top center', marginBottom: '2rem' }}
              >
                <WaliSantriCard
                  ref={cardRef}
                  data={{
                    photo: profile?.photo ?? null,
                    first_name: profile?.first_name ?? '',
                    last_name: profile?.last_name ?? null,
                    nik: profile?.nik ?? '',
                    parent_as: 'Wali',
                    phone: profile?.phone ?? null,
                    students: parentStudents.map((s) => ({
                      nis: s.nis,
                      first_name: s.first_name,
                      last_name: s.last_name ?? null,
                    })),
                  }}
                />
              </div>
              <div className="flex gap-2 mt-16">
                <Button variant="outline" onClick={() => setShowCardDialog(false)}>
                  Tutup
                </Button>
                <Button onClick={() => handlePrint()}>
                  <Printer className="mr-2 h-4 w-4" /> Cetak Sekarang
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <ChangePasswordFormModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />

      {/* Dialog Upload Foto (khusus wali santri) */}
      {isWaliSantri && currentUser && (
        <ParentPhotoUploadDialog
          open={showPhotoDialog}
          onOpenChange={setShowPhotoDialog}
          parentId={currentUser.id}
          currentPhotoUrl={profile?.photo ?? undefined}
        />
      )}
    </Layout>
  );
};

export default UserProfilePage;