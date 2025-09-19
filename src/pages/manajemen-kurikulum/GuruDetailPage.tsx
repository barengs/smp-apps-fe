import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useGetTeacherByIdQuery } from '@/store/slices/teacherApi';
import * as toast from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { User, ArrowLeft, Edit, Mail, Phone, MapPin, Briefcase, Key, Calendar, Home, Building2, Tent, Landmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Staff } from '@/types/teacher';

const DetailRow: React.FC<{ label: string; value?: React.ReactNode; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-start space-x-3 py-2 border-b last:border-b-0">
    {icon && <div className="flex-shrink-0 text-muted-foreground pt-1">{icon}</div>}
    <div className="flex-grow">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="text-base font-semibold break-words">{value || '-'}</div>
    </div>
  </div>
);

const GuruDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Debug log untuk melihat ID
  useEffect(() => {
    console.log('=== Guru Detail Page ===');
    console.log('ID from params:', id);
    console.log('========================');
  }, [id]);

  // Validasi ID di useEffect untuk menghindari setState dalam render
  useEffect(() => {
    if (!id) {
      toast.showError('ID guru tidak valid.');
      navigate('/dashboard/manajemen-kurikulum/guru');
    }
  }, [id, navigate]);

  const { data: apiResponse, error, isLoading } = useGetTeacherByIdQuery(id || '', {
    skip: !id, // Skip query jika ID tidak valid
  });

  // Struktur data yang benar: apiResponse.data adalah objek Staff langsung
  const teacher: Staff | undefined = apiResponse?.data;

  // Debug log untuk melihat data
  useEffect(() => {
    console.log('=== Teacher Data ===');
    console.log('teacher:', teacher);
    console.log('error:', error);
    console.log('isLoading:', isLoading);
    console.log('====================');
  }, [teacher, error, isLoading]);

  // Handle error dan redirect di useEffect
  useEffect(() => {
    if (error) {
      console.error('Error loading teacher:', error);
      toast.showError('Gagal memuat detail guru atau guru tidak ditemukan.');
      navigate('/dashboard/manajemen-kurikulum/guru');
    }
  }, [error, navigate]);

  // Jangan render apa-apa jika ID tidak valid
  if (!id) {
    return null;
  }

  const fullName = teacher ? `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() : 'Detail Guru';

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/administrasi' },
    { label: 'Manajemen Kurikulum', href: '/dashboard/manajemen-kurikulum/mata-pelajaran' },
    { label: 'Guru', href: '/dashboard/manajemen-kurikulum/guru' },
    { label: fullName, icon: <User className="h-4 w-4" /> },
  ];

  const handleEdit = () => {
    navigate(`/dashboard/manajemen-kurikulum/guru/${id}/edit`);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Detail Guru" role="administrasi">
        <div className="container mx-auto py-4 px-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 flex flex-col items-center">
                <Skeleton className="aspect-square w-full max-w-[240px] rounded-lg" />
                <Skeleton className="h-6 w-3/4 mt-4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </div>
              <div className="lg:col-span-2 space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-[150px_1fr] items-center gap-x-4">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Tampilkan pesan jika tidak ada data
  if (!teacher) {
    return (
      <DashboardLayout title="Detail Guru" role="administrasi">
        <div className="container mx-auto py-4 px-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Data guru tidak ditemukan</p>
                <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Data roles dari user.roles (jika ada)
  const roles = teacher.user?.roles || [];
  
  // Data wilayah masih null karena village_id null, tapi kita siapkan untuk data yang ada
  const fullAddress = teacher.address || 'Alamat tidak tersedia';

  return (
    <DashboardLayout title="Detail Guru" role="administrasi">
      <div className="container mx-auto pb-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Informasi Guru</CardTitle>
                <CardDescription>Detail lengkap mengenai guru ini.</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 flex flex-col items-center text-center">
              <div className="aspect-square w-full max-w-[240px] bg-muted rounded-lg flex items-center justify-center overflow-hidden border">
                {teacher.photo ? (
                  <img src={teacher.photo} alt={`Foto ${fullName}`} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-24 w-24 text-muted-foreground" />
                )}
              </div>
              <h3 className="mt-4 text-xl font-bold">{fullName}</h3>
              <p className="text-sm text-muted-foreground">{teacher.email || '-'}</p>
              <Badge variant={teacher.status === 'Aktif' ? 'success' : 'destructive'} className="mt-2">{teacher.status}</Badge>
            </div>
            <div className="lg:col-span-2">
              <DetailRow label="Email" value={teacher.email} icon={<Mail className="h-4 w-4" />} />
              <DetailRow label="Telepon" value={teacher.phone} icon={<Phone className="h-4 w-4" />} />
              <DetailRow label="Tempat, Tanggal Lahir" value={
                (() => {
                  let birthDateDisplay = '-';
                  if (teacher.birth_date) {
                    const dateObj = new Date(teacher.birth_date);
                    if (!isNaN(dateObj.getTime())) { // Memeriksa apakah tanggal valid
                      const formattedDate = format(dateObj, 'd MMMM yyyy', { locale: idLocale });
                      birthDateDisplay = `${teacher.birth_place || '-'} ${formattedDate}`;
                    } else {
                      birthDateDisplay = `${teacher.birth_place || '-'} Tanggal tidak valid`;
                    }
                  } else if (teacher.birth_place) {
                    birthDateDisplay = `${teacher.birth_place} Tanggal tidak tersedia`;
                  }
                  return birthDateDisplay;
                })()
              } icon={<Calendar className="h-4 w-4" />} />
              <DetailRow label="Alamat Lengkap" value={fullAddress} icon={<MapPin className="h-4 w-4" />} />
              <DetailRow label="NIK" value={teacher.nik} icon={<User className="h-4 w-4" />} />
              <DetailRow label="NIP" value={teacher.nip} icon={<User className="h-4 w-4" />} />
              <DetailRow label="Jenis Kelamin" value={teacher.gender === 'Pria' ? 'Laki-laki' : 'Perempuan'} icon={<User className="h-4 w-4" />} />
              <DetailRow label="Status Pernikahan" value={teacher.marital_status} icon={<User className="h-4 w-4" />} />
              <DetailRow label="Peran" value={
                roles && roles.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {roles.map((role, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{role.name}</Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 italic">Tidak ada peran</span>
                )
              } icon={<Key className="h-4 w-4" />} />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GuruDetailPage;