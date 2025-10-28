import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useGetParentByIdQuery } from '@/store/slices/parentApi';
import * as toast from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { User, Users, UserPlus, Edit, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

  const { data: parentData, error, isLoading } = useGetParentByIdQuery(parentId, { refetchOnMountOrArgChange: true });

  // Validasi ID di awal render
  if (isNaN(parentId)) {
    useEffect(() => {
      toast.showError('ID Wali Santri tidak valid.');
      navigate('/dashboard/wali-santri-list');
    }, [navigate]);
    return null;
  }

  // Tangani error dan data tidak ditemukan
  if (error || !parentData) {
    useEffect(() => {
      toast.showError('Gagal memuat detail wali santri atau data tidak ditemukan.');
      navigate('/dashboard/wali-santri-list');
    }, [error, parentData, navigate]);
    return null;
  }

  // Gunakan parent.id dari respons API sebagai ID utama
  const parentDetails = parentData.parent;
  const actualParentId = parentDetails?.id;
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
                <div className="flex items-center space-x-2">
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
                  {parentDetails?.photo ? (
                    <img src={parentDetails.photo} alt={`Foto ${fullName}`} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-24 w-24 text-muted-foreground" />
                  )}
                </div>
                <h3 className="mt-4 text-xl font-bold">{fullName}</h3>
                <p className="text-sm text-muted-foreground">{parentData?.email || '-'}</p>
              </div>
              <div className="lg:col-span-3">
                <DetailRow label="Nama Depan" value={parentDetails?.first_name} />
                <DetailRow label="Nama Belakang" value={parentDetails?.last_name} />
                <DetailRow label="Email" value={parentData?.email} />
                <DetailRow label="No. KK" value={parentDetails?.kk} />
                <DetailRow label="NIK" value={parentDetails?.nik} />
                <DetailRow label="Jenis Kelamin" value={parentDetails?.gender === 'L' ? 'Laki-Laki' : 'Perempuan'} />
                <DetailRow label="Status Wali" value={parentDetails?.parent_as} />
                <DetailRow label="Telepon" value={parentDetails?.phone} />

                <DetailRow label="Pekerjaan" value={parentDetails?.occupation?.name} />
                <DetailRow label="Pendidikan" value={parentDetails?.education?.name} />

                <DetailRow label="Alamat" value={parentDetails?.card_address} />
                <DetailRow label="Alamat Domisili" value={parentDetails?.domicile_address} />
                <DetailRow label="Tanggal Dibuat" value={parentData?.created_at ? new Date(parentData.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'} />
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
                    <TableHead>Alamat</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parentData?.students && parentData.students.length > 0 ? (
                    parentData.students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.nis}</TableCell>
                        <TableCell>{`${student.first_name} ${student.last_name || ''}`}</TableCell>
                        <TableCell>{student.address}</TableCell>
                        <TableCell>
                          <Badge variant={student.status === 'Aktif' ? 'default' : 'secondary'}>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/santri/${student.id}`)}>
                            <Eye className="mr-2 h-4 w-4" /> Lihat
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
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