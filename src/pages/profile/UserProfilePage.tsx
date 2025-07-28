import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { useGetProfileDetailsQuery } from '@/store/slices/authApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import ProfilePhotoCard from '@/components/ProfilePhotoCard'; // Import komponen baru

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

  if (isLoading) {
    return (
      <DashboardLayout title={t('profilePage.title')} role="administrasi">
        <div className="w-full max-w-4xl mx-auto"> {/* Kontainer utama untuk halaman penuh */}
          {/* Skeleton untuk Main Profile Card */}
          <Card className="w-full">
            <CardHeader className="flex flex-col items-center space-y-4 py-8 md:flex-row md:items-start md:space-y-0 md:space-x-6">
              {/* Skeleton untuk Photo Card di dalam header kartu utama */}
              <Card className="w-36 h-48 flex flex-col items-center justify-center relative overflow-hidden shadow-md">
                <CardContent className="p-0 w-full h-full flex items-center justify-center">
                  <Skeleton className="w-full h-full rounded-none" />
                </CardContent>
              </Card>
              <div className="space-y-2 text-center md:text-left">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-48" />
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
      if (error.data && typeof error.data === 'object' && 'message' in error.data) {
        errorMessage = (error.data as { message: string }).message;
      } else if (typeof error.status === 'number') {
        errorMessage = `Error ${error.status}`;
      } else {
        errorMessage = `Error: ${JSON.stringify(error)}`;
      }
    } else if (isSerializedError(error)) {
      errorMessage = error.message || 'Serialized error without message.';
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

  return (
    <DashboardLayout title={t('profilePage.title')} role="administrasi">
      <div className="w-full max-w-4xl mx-auto"> {/* Kontainer utama untuk halaman penuh */}
        {/* Kartu Utama Profil */}
        <Card className="w-full">
          <CardHeader className="flex flex-col items-center space-y-4 py-8 md:flex-row md:items-start md:space-y-0 md:space-x-6">
            {/* Kartu Foto Profil */}
            <ProfilePhotoCard
              photoUrl={profile?.photo}
              onEdit={handleEditPhoto}
            />
            <div className="text-center md:text-left">
              <CardTitle className="text-2xl">{profile?.first_name} {profile?.last_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kode</p>
                <p className="text-lg font-semibold">{profile?.code || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nama Depan</p>
                <p className="text-lg font-semibold">{profile?.first_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nama Belakang</p>
                <p className="text-lg font-semibold">{profile?.last_name || '-'}</p>
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