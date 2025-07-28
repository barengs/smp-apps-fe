import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useGetProfileQuery } from '@/store/slices/authApi';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { isFetchBaseQueryError, isSerializedError } from '@reduxjs/toolkit'; // Corrected import path

const UserProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { data: profileData, isLoading, isError, error } = useGetProfileQuery();

  if (isLoading) {
    return (
      <DashboardLayout title={t('profilePage.title')} role="administrasi"> {/* Role can be dynamic based on actual user role */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-10 w-full" />
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
      // Check if error.data exists and has a message property
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
        <div className="text-red-500">
          {t('profilePage.errorLoading')}: {errorMessage}
        </div>
      </DashboardLayout>
    );
  }

  const user = profileData?.data;

  return (
    <DashboardLayout title={t('profilePage.title')} role="administrasi"> {/* Role can be dynamic based on actual user role */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t('profilePage.personalInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">{t('profilePage.name')}</Label>
              <Input id="name" value={user?.name || ''} readOnly />
            </div>
            <div>
              <Label htmlFor="email">{t('profilePage.email')}</Label>
              <Input id="email" value={user?.email || ''} readOnly />
            </div>
            <div>
              <Label htmlFor="username">{t('profilePage.username')}</Label>
              <Input id="username" value={user?.username || ''} readOnly />
            </div>
            <div>
              <Label htmlFor="roles">{t('profilePage.roles')}</Label>
              <Input id="roles" value={user?.roles.map(role => role.name).join(', ') || ''} readOnly />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserProfilePage;