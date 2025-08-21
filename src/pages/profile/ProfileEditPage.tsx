import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useGetProfileDetailsQuery } from '@/store/slices/authApi';
import ProfileEditForm from '@/components/ProfileEditForm';
import { Skeleton } from '@/components/ui/skeleton';
import CustomBreadcrumb, { BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { User, Pencil } from 'lucide-react';

const ProfileEditPage: React.FC = () => {
  const { data: profileData, isLoading, isError } = useGetProfileDetailsQuery();

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Profil', href: '/dashboard/profile', icon: <User className="h-4 w-4" /> },
    { label: 'Edit', icon: <Pencil className="h-4 w-4" /> },
  ];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6 p-6 border rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
          </div>
          <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
          <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
          <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-24 w-full" /></div>
        </div>
      );
    }

    if (isError || !profileData?.data?.profile || !profileData?.data?.id) { // Check for profile and id
      return <div className="text-red-500 p-4 border border-red-500 rounded-md">Gagal memuat data profil atau ID pengguna tidak ditemukan. Silakan coba lagi.</div>;
    }

    return <ProfileEditForm initialData={profileData.data.profile} userId={profileData.data.id} />;
  };

  return (
    <DashboardLayout title="Edit Profil" role="administrasi">
      <div className="w-full max-w-4xl mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <div className="mt-6">
          {renderContent()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileEditPage;