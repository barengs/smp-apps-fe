import React, { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useGetTransactionByIdQuery } from '@/store/slices/bankApi';
import { Briefcase, Banknote, Receipt, ArrowLeft, Printer, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import * as toast from '@/utils/toast';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import TransactionPdf from '@/components/TransactionPdf';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"; // Import Dialog components

const DetailRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] items-center gap-x-4 py-2 border-b last:border-b-0">
    <span className="font-semibold text-gray-700">{label}:</span>
    <span className="text-gray-900 break-words">{value || '-'}</span>
  </div>
);

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'failed':
      return 'destructive';
    default:
      return 'outline';
  }
};

const TransaksiDetailPage: React.FC = () => {
  const { id: transactionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  const { data: apiResponse, isLoading, isError, error } = useGetTransactionByIdQuery(transactionId!, {
    skip: !transactionId,
  });

  const transaction = apiResponse?.data;

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Keuangan', href: '/dashboard/bank-santri', icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Transaksi', href: '/dashboard/bank-santri/transaksi', icon: <Receipt className="h-4 w-4" /> },
    { label: 'Detail Transaksi', icon: <Banknote className="h-4 w-4" /> },
  ];

  const formatCurrency = (amount: string) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return 'N/A';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numericAmount);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Detail Transaksi" role="administrasi">
        <div className="container mx-auto py-4 px-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <Card className="mt-4">
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-[180px_1fr] items-center gap-x-4">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !transaction) {
    console.error("Error fetching transaction details:", error);
    toast.showError('Gagal memuat detail transaksi atau transaksi tidak ditemukan.');
    return (
      <DashboardLayout title="Detail Transaksi" role="administrasi">
        <div className="container mx-auto py-4 px-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-500">Gagal memuat detail transaksi atau data tidak ditemukan.</p>
              <Button onClick={() => navigate('/dashboard/bank-santri/transaksi')} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Transaksi
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const PdfDocument = <TransactionPdf transaction={transaction} />;
  const pdfFileName = `Transaksi-${transaction.reference_number || transaction.id}.pdf`;

  return (
    <DashboardLayout title={`Detail Transaksi ${transaction.reference_number || transaction.id}`} role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Detail Transaksi</CardTitle>
              <CardDescription>Informasi lengkap mengenai transaksi ini.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/dashboard/bank-santri/transaksi')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
              </Button>
              <Button variant="info" onClick={() => setIsPrintPreviewOpen(true)}>
                <Printer className="mr-2 h-4 w-4" /> Cetak
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DetailRow label="ID Transaksi" value={transaction.id} />
            <DetailRow label="No. Referensi" value={transaction.reference_number} />
            <DetailRow label="Tipe Transaksi" value={<Badge variant="secondary" className="capitalize">{transaction.transaction_type}</Badge>} />
            <DetailRow label="Deskripsi" value={transaction.description} />
            <DetailRow label="Jumlah" value={formatCurrency(transaction.amount)} />
            <DetailRow label="Status" value={<Badge variant={getStatusVariant(transaction.status)} className="capitalize">{transaction.status}</Badge>} />
            <DetailRow label="Channel" value={transaction.channel} />
            <DetailRow label="Rekening Sumber" value={
              transaction.source_account
                ? (typeof transaction.source_account === 'object'
                  ? transaction.source_account.account_number
                  : transaction.source_account)
                : '-'
            } />
            <DetailRow label="Rekening Tujuan" value={
              transaction.destination_account
                ? (typeof transaction.destination_account === 'object'
                  ? transaction.destination_account.account_number
                  : transaction.destination_account)
                : '-'
            } />
            <DetailRow label="Tanggal Dibuat" value={format(new Date(transaction.created_at), 'dd MMMM yyyy HH:mm', { locale: id })} />
            <DetailRow label="Terakhir Diperbarui" value={format(new Date(transaction.updated_at), 'dd MMMM yyyy HH:mm', { locale: id })} />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isPrintPreviewOpen} onOpenChange={setIsPrintPreviewOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Pratinjau Cetak Transaksi</DialogTitle>
            <DialogDescription>
              Ini adalah pratinjau detail transaksi. Klik 'Unduh' untuk menyimpan sebagai PDF.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow bg-gray-200">
            {typeof window !== 'undefined' && (
              <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                {PdfDocument}
              </PDFViewer>
            )}
          </div>
          <DialogFooter className="p-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsPrintPreviewOpen(false)}>
              Tutup
            </Button>
            <PDFDownloadLink document={PdfDocument} fileName={pdfFileName}>
              {({ loading }) => (
                <Button disabled={loading}>
                  <Download className="mr-2 h-4 w-4" />
                  {loading ? 'Membuat PDF...' : 'Unduh'}
                </Button>
              )}
            </PDFDownloadLink>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default TransaksiDetailPage;