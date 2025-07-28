import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { useGetProfileDetailsQuery } from '@/store/slices/authApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import ProfilePhotoCard from '@/components/ProfilePhotoCard';
import { Button } from '@/components/ui/button';
import { Pencil, Key } from 'lucide-react'; // Import ikon Pencil dan Key

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

  const handleEditPhoto = () => {
    // Logika untuk mengedit foto (misalnya, membuka modal upload)
    console.log("Edit foto diklik!");
    // Anda bisa menambahkan logika modal di sini
  };

  const handleEditProfile = () => {
    console.log("Tombol Edit Profil diklik!");
    // Logika untuk mengedit detail profil
  };

  const handleChangePassword = () => {
    console.log("Tombol Ganti Password diklik!");
    // Logika untuk mengganti password
  };

  if (isLoading) {
    return (
      <DashboardLayout title={t('profilePage.title')} role="administrasi">
        <div className="w-full max-w-4xl mx-auto">
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
      </DashboardLayout>
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
      <DashboardLayout title={t('profilePage.title')} role="administrasi">
        <div className="text-red-500 p-4">
          {t('profilePage.errorLoading')}: {errorMessage}
        </div>
      </DashboardLayout>
    );
  }

  const profile = profileData?.data?.profile;
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || '-';

  return (
    <DashboardLayout title={t('profilePage.title')} role="administrasi">
      <div className="w-full max-w-4xl mx-auto">
        <Card className="w-full">
          <CardHeader className="flex flex-col items-center space-y-4 py-8 md:flex-row md:items-start md:space-y-0 md:space-x-6 md:justify-between">
            <div className="flex flex-col items-center space-y-4 md:flex-row md:items-start md:space-y-0 md:space-x-6">
              <ProfilePhotoCard
                photoUrl={profile?.photo}
                onEdit={handleEditPhoto}
              />
              <div className="text-center md:text-left">
                <CardTitle className="text-2xl">{fullName}</CardTitle>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button variant="outline" onClick={handleEditProfile}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button onClick={handleChangePassword}>
                <Key className="mr-2 h-4 w-4" /> Ganti Password
              </Button>
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
    </DashboardLayout>
  );
};

export default UserProfilePage;