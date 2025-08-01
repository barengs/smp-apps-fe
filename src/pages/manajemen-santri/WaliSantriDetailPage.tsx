import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useGetParentByIdQuery } from '@/store/slices/parentApi';
import * as toast from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { User, Users, UserPlus, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react'; // Import ArrowLeft icon

const DetailRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="grid grid-cols-[150px_1fr] items-center gap-x-4 py-2 border-b last:border-b-0">
    <span className="font-semibold text-gray-700">{label}:</span>
    <div className="text-gray-900 break-words">{value || '-'}</div>
  </div>
);

const WaliSantriDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const parentId = parseInt(id || '', 10);

  if (isNaN(parentId)) {
    toast.showError('ID Wali Santri tidak valid.');
    navigate('/dashboard/wali-santri-list');
    return null;
  }

  const { data: responseData, error, isLoading } = useGetParentByIdQuery(parentId);

  const parentData = responseData?.data;
  const parentDetails = parentData?.parent;
  const fullName = parentDetails ? `${parentDetails.first_name || ''} ${parentDetails.last_name || ''}`.trim() : 'Detail Wali Santri';

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Santri', href: '/dashboard/santri', icon: <Users className="h-4 w-4" /> },
    { label: 'Wali Santri', href: '/dashboard/wali-santri-list', icon: <UserPlus className="h-4 w-4" /> },
    { label: fullName, icon: <User className="h-4 w-4" /> },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Detail Wali Santri" role="administrasi">
        <div className="container mx-auto py-4 px-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 flex flex-col items-center">
                <Skeleton className="aspect-[3/4] w-full max-w-[240px] rounded-lg" />
                <Skeleton className="h-6 w-3/4 mt-4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </div>
              <div className="lg:col-span-3 space-y-4">
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

  if (error || !parentData || !parentDetails) {
    toast.showError('Gagal memuat detail wali santri atau data tidak ditemukan.');
    navigate('/dashboard/wali-santri-list');
    return null;
  }

  return (
    <DashboardLayout title="Detail Wali Santri" role="administrasi">
      <div className="container mx-auto pb-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <div className="space-y-6">
          <Card className="w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Informasi Wali Santri</CardTitle>
                  <CardDescription>Detail lengkap mengenai wali santri.</CardDescription>
                </div>
                <div className="flex items-center space-x-2"> {/* Add a div for spacing */}
                  <Button variant="outline" onClick={() => navigate('/dashboard/wali-santri-list')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                  </Button>
                  <Button variant="outline" onClick={() => toast.showWarning('Fitur edit akan segera tersedia.')}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 flex flex-col items-center text-center">
                <div className="aspect-[3/4] w-full max-w-[240px] bg-muted rounded-lg flex items-center justify-center overflow-hidden border">
                  {parentDetails.photo ? (
                    <img src={parentDetails.photo} alt={`Foto ${fullName}`} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-24 w-24 text-muted-foreground" />
                  )}
                </div>
                <h3 className="mt-4 text-xl font-bold">{fullName}</h3>
                <p className="text-sm text-muted-foreground">{parentData.email || '-'}</p>
              </div>
              <div className="lg:col-span-3">
                <DetailRow label="Nama Depan" value={parentDetails.first_name} />
                <DetailRow label="Nama Belakang" value={parentDetails.last_name} />
                <DetailRow label="Email" value={parentData.email} />
                <DetailRow label="No. KK" value={parentDetails.kk} />
                <DetailRow label="NIK" value={parentDetails.nik} />
                <DetailRow label="Jenis Kelamin" value={parentDetails.gender === 'L' ? 'Laki-Laki' : 'Perempuan'} />
                <DetailRow label="Status Wali" value={parentDetails.parent_as} />
                <DetailRow label="Telepon" value={parentDetails.phone} />
                <DetailRow label="Alamat" value={parentDetails.card_address} />
                <DetailRow label="Tanggal Dibuat" value={parentData.created_at ? new Date(parentData.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Santri Terkait</CardTitle>
              <CardDescription>Daftar santri yang berada di bawah perwalian ini.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIS</TableHead>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parentData.students && parentData.students.length > 0 ? (
                    parentData.students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.nis}</TableCell>
                        <TableCell>{`${student.first_name} ${student.last_name || ''}`.trim()}</TableCell>
                        <TableCell>{student.status}</TableCell>
                        <TableCell>
                          <Button asChild variant="link" className="p-0 h-auto">
                            <Link to={`/dashboard/santri/${student.id}`}>Lihat Detail</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Tidak ada santri terkait.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WaliSantriDetailPage;