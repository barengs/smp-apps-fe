import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useGetTransactionByIdQuery, useValidateTransactionMutation } from '@/store/slices/bankApi';
import { Briefcase, Banknote, Receipt, ArrowLeft, Printer, Download, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import * as toast from '@/utils/toast';
import { openTransactionPdf } from '@/components/TransactionPdf';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DetailRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] items-center gap-x-4 py-2 border-b last:border-b-0">
    <span className="font-semibold text-gray-700">{label}:</span>
    <span className="text-gray-900 break-words">{value || '-'}</span>
  </div>
);

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'success':
      return 'default'; // Hijau untuk completed/success
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
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  const { data: apiResponse, isLoading, isError, error, refetch } = useGetTransactionByIdQuery(transactionId!, {
    skip: !transactionId,
  });
  const [validateTransaction, { isLoading: isValidationLoading }] = useValidateTransactionMutation();

  const transaction = apiResponse?.data;

  // Add: compute changeAmount from paymentAmount and transaction.amount
  const paidAmountNumber = parseFloat(paymentAmount || '0');
  const changeAmount = transaction ? paidAmountNumber - parseFloat(String(transaction.amount)) : 0;

  // NEW: state untuk QR data URL
  const [qrDataUrl, setQrDataUrl] = useState<string | undefined>(undefined);

  // NEW: generate QR saat ID transaksi tersedia
  React.useEffect(() => {
    const idValue = transaction?.id != null ? String(transaction.id).trim() : '';
    if (!idValue) {
      setQrDataUrl(undefined);
      return;
    }
    let isMounted = true;
    (async () => {
      const { default: QRCode } = await import('qrcode');
      const url = await QRCode.toDataURL(idValue, { errorCorrectionLevel: 'H', margin: 0, scale: 4 });
      if (isMounted) setQrDataUrl(url);
    })();
    return () => { isMounted = false; };
  }, [transaction?.id]);

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Keuangan', href: '/dashboard/bank-santri', icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Transaksi', href: '/dashboard/bank-santri/transaksi', icon: <Receipt className="h-4 w-4" /> },
    { label: 'Detail Transaksi', icon: <Banknote className="h-4 w-4" /> },
  ];

  const formatCurrency = (amount: string | number) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return 'N/A';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numericAmount);
  };

  const handleValidate = async () => {
    if (!transactionId || !paymentAmount || !transaction) return;

    const paidAmountNumber = parseFloat(paymentAmount);
    if (isNaN(paidAmountNumber) || paidAmountNumber < parseFloat(transaction.amount)) {
      toast.showError("Jumlah pembayaran tidak valid atau kurang dari tagihan.");
      return;
    }

    try {
      await validateTransaction({ id: transactionId }).unwrap();
      toast.showSuccess("Transaksi berhasil divalidasi.");
      setIsValidationModalOpen(false);
      setPaymentAmount('');
      refetch();
    } catch (err) {
      console.error("Failed to validate transaction:", err);
      toast.showError("Gagal memvalidasi transaksi. Silakan coba lagi.");
    }
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
              {transaction.status.toLowerCase() === 'pending' && (
                <Button variant="success" onClick={() => setIsValidationModalOpen(true)}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Validasi
                </Button>
              )}
              <Button
                variant="info"
                onClick={() => transaction && openTransactionPdf(transaction)}
                disabled={!transaction}
              >
                <Printer className="mr-2 h-4 w-4" /> Cetak
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DetailRow label="ID Transaksi" value={transaction.id} />
            <DetailRow label="No. Referensi" value={transaction.reference_number} />
            <DetailRow label="Tipe Transaksi" value={
              <Badge variant="secondary" className="capitalize">
                {typeof transaction.transaction_type === 'object' && transaction.transaction_type !== null
                  ? transaction.transaction_type.name || transaction.transaction_type.code || 'Unknown'
                  : typeof transaction.transaction_type === 'string'
                  ? transaction.transaction_type
                  : 'Unknown'}
              </Badge>
            } />
            <DetailRow label="Deskripsi" value={transaction.description} />
            <DetailRow label="Jumlah" value={formatCurrency(transaction.amount)} />
            <DetailRow label="Status" value={<Badge variant={getStatusVariant(transaction.status)} className="capitalize">{transaction.status}</Badge>} />
            <DetailRow label="Channel" value={transaction.channel} />
            <DetailRow label="Rekening Sumber" value={
              typeof transaction.source_account === 'object' && transaction.source_account !== null
                ? transaction.source_account.account_number
                : String(transaction.source_account || '-')
            } />
            <DetailRow label="Rekening Tujuan" value={
              typeof transaction.destination_account === 'object' && transaction.destination_account !== null
                ? transaction.destination_account.account_number
                : String(transaction.destination_account || '-')
            } />
            <DetailRow label="Tanggal Dibuat" value={format(new Date(transaction.created_at), 'dd MMMM yyyy HH:mm', { locale: id })} />
            <DetailRow label="Terakhir Diperbarui" value={format(new Date(transaction.updated_at), 'dd MMMM yyyy HH:mm', { locale: id })} />
          </CardContent>
        </Card>

        {/* Ledger Entries Card */}
        {transaction.ledger_entries && transaction.ledger_entries.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Entri Jurnal</CardTitle>
              <CardDescription>Detail entri akuntansi untuk transaksi ini.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transaction.ledger_entries.map((entry, index) => (
                  <div key={entry.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <DetailRow label="No. Urut" value={index + 1} />
                      <DetailRow label="Kode COA" value={entry.coa_code} />
                      <DetailRow label="Tipe Entri" value={
                        <Badge variant={entry.entry_type === 'DEBIT' ? 'default' : 'secondary'}>
                          {entry.entry_type}
                        </Badge>
                      } />
                      <DetailRow label="Jumlah" value={formatCurrency(entry.amount)} />
                      <DetailRow label="Waktu Entri" value={entry.entry_time} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Validation Dialog */}
      <Dialog open={isValidationModalOpen} onOpenChange={setIsValidationModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Validasi Pembayaran</DialogTitle>
            <DialogDescription>
              Konfirmasi pembayaran untuk No. Referensi: {transaction.reference_number}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Total Tagihan</td>
                    <td className="p-3 text-right font-semibold">{formatCurrency(transaction.amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Jumlah Dibayar</Label>
              <Input
                id="paymentAmount"
                type="number"
                placeholder="Masukkan nominal pembayaran"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="text-right"
              />
            </div>
            {changeAmount >= 0 && (
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b bg-green-50">
                      <td className="p-3 font-medium">Sisa (Kembalian)</td>
                      <td className="p-3 text-right font-semibold text-green-700">
                        {formatCurrency(changeAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsValidationModalOpen(false)}>Batal</Button>
            <Button onClick={handleValidate} disabled={!paymentAmount || changeAmount < 0 || isValidationLoading}>
              {isValidationLoading ? 'Memproses...' : 'Konfirmasi Pembayaran'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default TransaksiDetailPage;