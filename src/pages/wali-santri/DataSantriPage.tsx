import React from 'react';
import { useNavigate } from 'react-router-dom';
import WaliSantriLayout from '@/layouts/WaliSantriLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetSantriByParentNikQuery, useGetProfileDetailsQuery } from '@/store/slices/authApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Bed, BookOpen, Calendar } from 'lucide-react';

const DataSantriPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  // Prioritize NIK from currentUser, but if not present, we will try to fetch it.
  const storedNik = currentUser?.profile?.nik;

  // Always fetch profile details to ensure we have the up-to-date NIK, especially if currentUser is stale.
  const { data: profileData, isLoading: isProfileLoading } = useGetProfileDetailsQuery(undefined, {
      skip: !!storedNik, // Skip if we already have it from store (optional optimization, but safely maybe better to not skip or only skip if we are sure)
  });

  const nik = storedNik || profileData?.data?.profile?.nik;

  const { data: santriData, isLoading: isSantriLoading, isError, error } = useGetSantriByParentNikQuery(nik || '', {
    skip: !nik,
  });

  const students = santriData?.data?.student || [];
  const isLoading = isProfileLoading || isSantriLoading;

  const renderContent = () => {
    if (!nik && !isLoading) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              Data profile orang tua tidak lengkap (NIK tidak ditemukan).
              <br/>
              Silakan lengkapi data profil Anda terlebih dahulu.
            </div>
          </CardContent>
        </Card>
      );
    }

    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              Gagal memuat data santri. Silakan coba lagi nanti.
              <br />
              <span className="text-sm text-gray-400">
                {(error as any)?.data?.message || JSON.stringify(error)}
              </span>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (students.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground p-8">
              <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>Tidak ada data santri yang terhubung dengan akun Anda.</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => {
           const fullName = [student.first_name, student.last_name].filter(Boolean).join(' ');
           const photoUrl = student.photo 
             ? (student.photo.startsWith('http') ? student.photo : `${import.meta.env.VITE_API_URL || ''}/storage/${student.photo}`) 
             : null;

           return (
            <Card 
              key={student.id} 
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => navigate(`/dashboard/wali-santri/data-santri/${student.id}`)}
            >
              <div className="h-24 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:from-blue-600 group-hover:to-cyan-600 transition-colors"></div>
              <div className="px-6 relative pb-6">
                <div className="absolute -top-24 left-6">
                  <div className="h-24 w-24 rounded-lg border-4 border-white shadow-sm bg-white overflow-hidden">
                    {photoUrl ? (
                      <img 
                        src={photoUrl} 
                        alt={fullName} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-2xl">
                        {student.first_name[0]}{student.last_name ? student.last_name[0] : ''}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1" title={fullName}>{fullName}</h3>
                  <div className="flex flex-wrap items-center gap-y-1 text-sm text-muted-foreground mt-1">
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 text-xs">
                      {student.nis}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                  </div>
                  {student.born_at && (
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      <span>
                        {new Date(student.born_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mt-6">
                  <div className="flex items-center text-sm">
                    <BookOpen className="h-4 w-4 mr-3 text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-muted-foreground text-xs">Program Pendidikan</p>
                      <p className="font-medium text-gray-700">{student.program?.name || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Bed className="h-4 w-4 mr-3 text-indigo-500 flex-shrink-0" />
                    <div>
                      <p className="text-muted-foreground text-xs">Asrama</p>
                      <p className="font-medium text-gray-700">{student.hostel?.name || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <WaliSantriLayout title="Data Santri" role="wali-santri">
      <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Data Anak Saya</h1>
        {renderContent()}
      </div>
    </WaliSantriLayout>
  );
};

export default DataSantriPage;
