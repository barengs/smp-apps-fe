import React from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useGetAccountByIdQuery } from '@/store/slices/accountApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import CustomBreadcrumb, { BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Briefcase, Banknote, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b">
    <span className="text-sm text-muted-foreground mb-1 sm:mb-0">{label}</span>
    <span className="text-sm font-medium text-left sm:text-right">{value || '-'}</span>
  </div>
);

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status.toUpperCase()) {
    case 'AKTIF':
    case 'ACTIVE':
      return 'default';
    case 'TIDAK AKTIF':
    case 'INACTIVE':
      return 'secondary';
    case 'DIBEKUKAN':
    case 'FROZEN':
      return 'destructive';
    case 'DITUTUP':
    case 'CLOSED':
      return 'outline';
    default:
      return 'outline';
  }
};

const RekeningDetailPage: React.FC = () => {
  const { accountNumber } = useParams<{ accountNumber: string }>();
  const { data: response, isLoading, isError } = useGetAccountByIdQuery(accountNumber!, {
    skip: !accountNumber,
  });

  const account = response?.data;

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Keuangan', href: '/dashboard/bank-santri', icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Rekening', href: '/dashboard/bank-santri/rekening', icon: <Banknote className="h-4 w-4" /> },
    { label: 'Detail Rekening', icon: <FileText className="h-4 w-4" /> },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Detail Rekening" role="administrasi">
        <div className="container mx-auto py-4 px-4 space-y-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !account) {
    return (
      <DashboardLayout title="Detail Rekening" role="administrasi">
        <div className="container mx-auto py-4 px-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-500">Gagal memuat detail rekening atau data tidak ditemukan.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const { customer, product } = account;

  return (
    <DashboardLayout title={`Detail Rekening ${account.account_number}`} role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Informasi Rekening</CardTitle>
              <CardDescription>Detail lengkap mengenai rekening.</CardDescription>
            </CardHeader>
            <CardContent>
              <DetailItem label="Nomor Rekening" value={account.account_number} />
              <DetailItem label="Saldo" value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(parseFloat(account.balance))} />
              <DetailItem label="Status" value={<Badge variant={getStatusVariant(account.status)}>{account.status}</Badge>} />
              <DetailItem label="Tanggal Buka" value={format(new Date(account.open_date), 'd MMMM yyyy', { locale: id })} />
              <DetailItem label="Tanggal Tutup" value={account.close_date ? format(new Date(account.close_date), 'd MMMM yyyy', { locale: id }) : '-'} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Produk</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailItem label="Nama Produk" value={product.product_name} />
              <DetailItem label="Jenis Produk" value={product.product_type} />
              <DetailItem label="Suku Bunga" value={`${parseFloat(product.interest_rate)}%`} />
              <DetailItem label="Biaya Admin" value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(parseFloat(product.admin_fee))} />
              <DetailItem label="Status Produk" value={<Badge variant={product.is_active ? 'default' : 'secondary'}>{product.is_active ? 'Aktif' : 'Tidak Aktif'}</Badge>} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" /> Informasi Pemilik
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-x-8 gap-y-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2 text-primary">Data Diri</h3>
                <DetailItem label="Nama Lengkap" value={`${customer.first_name} ${customer.last_name || ''}`.trim()} />
                <DetailItem label="NIS" value={customer.nis} />
                <DetailItem label="NIK" value={customer.nik} />
                <DetailItem label="Jenis Kelamin" value={customer.gender === 'L' ? 'Laki-laki' : 'Perempuan'} />
                <DetailItem label="Tempat, Tgl Lahir" value={`${customer.born_in}, ${format(new Date(customer.born_at), 'd MMMM yyyy', { locale: id })}`} />
                <DetailItem label="Status Santri" value={<Badge variant="outline">{customer.status}</Badge>} />
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-primary">Kontak & Alamat</h3>
                <DetailItem label="Alamat" value={customer.address} />
                <DetailItem label="Desa/Kelurahan" value={customer.village} />
                <DetailItem label="Kecamatan" value={customer.district} />
                <DetailItem label="Telepon" value={customer.phone} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RekeningDetailPage;