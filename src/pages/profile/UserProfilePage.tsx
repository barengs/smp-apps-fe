import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next'; // Tetap impor untuk t('profilePage.title') dan pesan error
import { useGetProfileDetailsQuery } from '@/store/slices/authApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { User } from 'lucide-react';

// Custom type guards for robust error handling
function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error != null && 'status' in error;
}

function isSerializedError(error: unknown): error is SerializedError {
  return typeof error === 'object' && error != null && 'message' in error;
}

const UserProfilePage: React.FC = () => {
  const { t } = useTranslation(); // Tetap gunakan t untuk judul halaman dan pesan error
  const { data: profileData, isLoading, isError, error } = useGetProfileDetailsQuery();

  if (isLoading) {
    return (
      <DashboardLayout title={t('profilePage.title')} role="administrasi">
        <div className="w-full max-w-4xl mx-auto"> {/* Menggunakan w-full dan max-w-4xl untuk lebar */}
          <Card>
            <CardHeader className="flex flex-col items-center space-y-4 py-8">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2 text-center">
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
        <Card>
          <CardHeader className="flex flex-col items-center space-y-4 py-8">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.photo || "/avatar-placeholder.png"} alt="User Photo" />
              <AvatarFallback><User className="h-12 w-12" /></AvatarFallback>
            </Avatar>
            <div className="text-center">
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