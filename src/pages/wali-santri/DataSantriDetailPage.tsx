
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WaliSantriLayout from '@/layouts/WaliSantriLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, MapPin, Phone, Mail, Home, School, AlertTriangle, FileText } from 'lucide-react';
import {
  useGetStudentDetailQuery,
  useGetStudentViolationsQuery,
  useGetStudentLeavesQuery
} from '@/store/slices/authApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DataSantriDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: studentDetailData, isLoading: isDetailLoading, error: detailError } = useGetStudentDetailQuery(id || '', { skip: !id });
  const { data: violationsData, isLoading: isViolationsLoading } = useGetStudentViolationsQuery(id || '', { skip: !id });
  const { data: leavesData, isLoading: isLeavesLoading } = useGetStudentLeavesQuery(id || '', { skip: !id });

  const student = studentDetailData?.data;
  const violations = violationsData?.data || [];
  const leaves = leavesData?.data || [];
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const photoUrl = student?.photo 
    ? (student.photo.startsWith('http') ? student.photo : `${import.meta.env.VITE_API_URL || ''}/storage/${student.photo}`) 
    : null;

  if (isDetailLoading) {
    return (
      <WaliSantriLayout title="Detail Santri" role="wali-santri">
        <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
           <Skeleton className="h-10 w-40" />
           <Skeleton className="h-64 w-full rounded-xl" />
           <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </WaliSantriLayout>
    );
  }

  if (detailError || !student) {
    return (
        <WaliSantriLayout title="Detail Santri" role="wali-santri">
          <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Button variant="ghost" className="mb-6 pl-0" onClick={() => navigate('/dashboard/wali-santri/data-santri')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
            </Button>
            <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6 text-center text-red-600">
                    Gagal memuat data santri. Data tidak ditemukan atau terjadi kesalahan.
                </CardContent>
            </Card>
          </div>
        </WaliSantriLayout>
    );
  }

  return (
    <WaliSantriLayout title="Detail Santri" role="wali-santri">
      <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Back Button */}
        <Button 
            variant="ghost" 
            className="pl-0 hover:pl-0 hover:bg-transparent -ml-2 text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/dashboard/wali-santri/data-santri')}
        >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Data Santri
        </Button>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
            {/* Background Decoration */}
             <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-10 pointer-events-none"></div>

            <div className="relative z-10 flex-shrink-0">
                <div className="h-32 w-32 md:h-40 md:w-40 rounded-xl overflow-hidden border-4 border-white shadow-md bg-gray-100">
                    {photoUrl ? (
                         <img src={photoUrl} alt={student.first_name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-slate-200 text-slate-400">
                            <User className="h-16 w-16" />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 space-y-4 pt-2 z-10">
                <div>
                     <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {student.first_name} {student.last_name || ''}
                        </h1>
                        <Badge variant={student.status === 'Aktif' ? 'default' : 'secondary'} className={student.status === 'Aktif' ? 'bg-green-500 hover:bg-green-600' : ''}>
                            {student.status}
                        </Badge>
                     </div>
                     <div className="flex items-center text-muted-foreground font-mono bg-slate-100 w-fit px-2 py-1 rounded text-sm">
                        NIS: {student.nis}
                     </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mt-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                            <School className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Program Pendidikan</p>
                            <p className="font-medium text-gray-700">{student.program?.name || '-'}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                            <Home className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Asrama</p>
                            <p className="font-medium text-gray-700">{student.hostel?.name || '-'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 rounded-full text-orange-600">
                            <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Kamar Saat Ini</p>
                            <p className="font-medium text-gray-700">
                                {student.current_room?.room_name || '-'} 
                                {student.current_room?.hostel_name ? ` (${student.current_room.hostel_name})` : ''}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="biodata" className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-3 bg-white h-auto p-1 border shadow-sm rounded-lg mb-6">
                <TabsTrigger value="biodata" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 py-2.5">Biodata</TabsTrigger>
                <TabsTrigger value="pelanggaran" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700 py-2.5">Riwayat Pelanggaran</TabsTrigger>
                <TabsTrigger value="perizinan" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 py-2.5">Riwayat Perizinan</TabsTrigger>
            </TabsList>

            <TabsContent value="biodata" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5 text-gray-500" />
                                Informasi Pribadi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <span className="text-muted-foreground">Tempat, Tgl Lahir</span>
                                <span className="col-span-2 font-medium">
                                    {student.born_in ? `${student.born_in}, ` : ''} 
                                    {formatDate(student.born_at)}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <span className="text-muted-foreground">Jenis Kelamin</span>
                                <span className="col-span-2 font-medium">{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <span className="text-muted-foreground">NIK</span>
                                <span className="col-span-2 font-medium">{student.nik || '-'}</span>
                            </div>
                             <div className="grid grid-cols-3 gap-2 text-sm">
                                <span className="text-muted-foreground">KK</span>
                                <span className="col-span-2 font-medium">{student.kk || '-'}</span>
                            </div>
                             <div className="grid grid-cols-3 gap-2 text-sm">
                                <span className="text-muted-foreground">Alamat</span>
                                <span className="col-span-2 font-medium">{student.address || '-'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5 text-gray-500" />
                                Data Wali
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="grid grid-cols-3 gap-2 text-sm">
                                <span className="text-muted-foreground">Nama Wali</span>
                                <span className="col-span-2 font-medium">
                                    {student.parents?.first_name} {student.parents?.last_name || ''}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <span className="text-muted-foreground">No. Telepon</span>
                                <span className="col-span-2 font-medium flex items-center gap-2">
                                    <Phone className="h-3 w-3" />
                                    {student.parents?.phone || '-'}
                                </span>
                            </div>
                             <div className="grid grid-cols-3 gap-2 text-sm">
                                <span className="text-muted-foreground">Email</span>
                                <span className="col-span-2 font-medium flex items-center gap-2">
                                    <Mail className="h-3 w-3" />
                                    {student.parents?.email || '-'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="pelanggaran" className="mt-0">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Catatan Pelanggaran
                        </CardTitle>
                        <CardDescription>
                            Daftar pelanggaran yang tercatat selama masa pendidikan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isViolationsLoading ? (
                             <div className="space-y-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                             </div>
                        ) : violations.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Pelanggaran</TableHead>
                                            <TableHead>Poin</TableHead>
                                            <TableHead>Sanksi</TableHead>
                                            <TableHead>Catatan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {violations.map((v) => (
                                            <TableRow key={v.id}>
                                                <TableCell className="font-medium whitespace-nowrap">{formatDate(v.date)}</TableCell>
                                                <TableCell>{v.violation?.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">
                                                        {v.violation?.points} Poin
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{v.sanction?.name || '-'}</TableCell>
                                                <TableCell className="text-muted-foreground text-sm">{v.notes || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                                Tidak ada catatan pelanggaran. Alhamdulillah!
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

             <TabsContent value="perizinan" className="mt-0">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                            <FileText className="h-5 w-5" />
                            Riwayat Perizinan
                        </CardTitle>
                        <CardDescription>
                            Daftar izin pulang atau keluar lingkungan pesantren.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         {isLeavesLoading ? (
                             <div className="space-y-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                             </div>
                        ) : leaves.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Mulai</TableHead>
                                            <TableHead>Selesai</TableHead>
                                            <TableHead>Jenis Izin</TableHead>
                                            <TableHead>Alasan</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {leaves.map((l) => (
                                            <TableRow key={l.id}>
                                                <TableCell className="font-medium whitespace-nowrap">{formatDate(l.start_date)}</TableCell>
                                                <TableCell className="whitespace-nowrap">{formatDate(l.end_date)}</TableCell>
                                                <TableCell>{l.leave_type?.name}</TableCell>
                                                <TableCell className="max-w-xs truncate" title={l.reason}>{l.reason}</TableCell>
                                                <TableCell>
                                                    <Badge 
                                                        variant={l.status === 'approved' ? 'default' : l.status === 'rejected' ? 'destructive' : 'secondary'}
                                                        className={l.status === 'approved' ? 'bg-green-500' : ''}
                                                    >
                                                        {l.status === 'approved' ? 'Disetujui' : l.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                                Tidak ada riwayat perizinan.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </WaliSantriLayout>
  );
};

export default DataSantriDetailPage;
