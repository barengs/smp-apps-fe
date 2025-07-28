import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { useGetProfileDetailsQuery } from '@/store/slices/authApi';
import { isFetchBaseQueryError, isSerializedError } from '@reduxjs/toolkit'; // Ini adalah impor yang benar untuk RTK 2.x
import { User } from 'lucide-react';

const UserProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { data: profileData, isLoading, isError, error } = useGetProfileDetailsQuery();

  if (isLoading) {
    return (
      <DashboardLayout title={t('profilePage.title')} role="administrasi">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center space-x-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div><Skeleton className="h-4 w-1/4 mb-2" /><Skeleton className="h-10 w-full" /></div>
              <div><Skeleton className="h-4 w-1/4 mb-2" /><Skeleton className="h-10 w-full" /></div>
              <div><Skeleton className="h-4 w-1/4 mb-2" /><Skeleton className="h-10 w-full" /></div>
              <div><Skeleton className="h-4 w-1/4 mb-2" /><Skeleton className="h-10 w-full" /></div>
              <div><Skeleton className="h-4 w-1/4 mb-2" /><Skeleton className="h-10 w-full" /></div>
              <div><Skeleton className="h-4 w-1/4 mb-2" /><Skeleton className="h-10 w-full" /></div>
              <div><Skeleton className="h-4 w-1/4 mb-2" /><Skeleton className="h-10 w-full" /></div>
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
        errorMessage = `Error: ${error.status}`;
      }
    } else if (isSerializedError(error)) {
      errorMessage = error.message || 'Serialized error without message.';
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.photo || "/avatar-placeholder.png"} alt="User Photo" />
              <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{profile?.first_name} {profile?.last_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="code">{t('profilePage.code')}</Label>
              <Input id="code" value={profile?.code || ''} readOnly />
            </div>
            <div>
              <Label htmlFor="firstName">{t('profilePage.firstName')}</Label>
              <Input id="firstName" value={profile?.first_name || ''} readOnly />
            </div>
            <div>
              <Label htmlFor="lastName">{t('profilePage.lastName')}</Label>
              <Input id="lastName" value={profile?.last_name || ''} readOnly />
            </div>
            <div>
              <Label htmlFor="email">{t('profilePage.email')}</Label>
              <Input id="email" value={profile?.email || ''} readOnly />
            </div>
            <div>
              <Label htmlFor="phone">{t('profilePage.phone')}</Label>
              <Input id="phone" value={profile?.phone || ''} readOnly />
            </div>
            <div>
              <Label htmlFor="address">{t('profilePage.address')}</Label>
              <Input id="address" value={profile?.address || ''} readOnly />
            </div>
            <div>
              <Label htmlFor="zipCode">{t('profilePage.zipCode')}</Label>
              <Input id="zipCode" value={profile?.zip_code || ''} readOnly />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserProfilePage;