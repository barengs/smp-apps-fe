import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import WaliSantriLayout from '@/layouts/WaliSantriLayout';
import { useGetProfileDetailsQuery } from '@/store/slices/authApi';
import ProfileEditForm from '@/components/ProfileEditForm';
import { Skeleton } from '@/components/ui/skeleton';
import CustomBreadcrumb, { BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { User, Pencil } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';

const ProfileEditPage: React.FC = () => {
  const { data: profileData, isLoading, isError } = useGetProfileDetailsQuery();
  const currentUser = useSelector(selectCurrentUser);

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Profil', href: '/dashboard/profile', icon: <User className="h-4 w-4" /> },
    { label: 'Edit', icon: <Pencil className="h-4 w-4" /> },
  ];

  // Determine layout based on role
  const isWaliSantri = currentUser?.roles?.some(role => role.name === 'orangtua');
  const Layout = isWaliSantri ? WaliSantriLayout : DashboardLayout;
  const layoutProps = isWaliSantri 
    ? { title: "Edit Profil", role: "wali-santri" as const }
    : { title: "Edit Profil", role: "administrasi" as const };

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

    // Pass the entire User object (profileData.data) to ProfileEditForm
    return <ProfileEditForm userFullData={profileData.data} />;
  };

  return (
    <Layout {...layoutProps}>
      <div className="w-full max-w-4xl mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <div className="mt-6">
          {renderContent()}
        </div>
      </div>
    </Layout>
  );
};

export default ProfileEditPage;