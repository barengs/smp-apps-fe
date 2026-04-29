import React, { useState } from 'react';
import { useGetTopUpsQuery, useVerifyTopUpMutation, TopUpRequest } from '@/store/slices/topUpApi';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, XCircle, Eye, Loader2, ArrowRightLeft } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/utils/formatCurrency';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { Badge } from '@/components/ui/badge';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import DashboardLayout from '@/layouts/DashboardLayout';

const TopUpVerificationPage: React.FC = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  
  const { data, isLoading, isFetching } = useGetTopUpsQuery({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
  });

  const [verifyTopUp, { isLoading: isVerifying }] = useVerifyTopUpMutation();

  const [selectedRequest, setSelectedRequest] = useState<TopUpRequest | null>(null);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [actionType, setActionType] = useState<'success' | 'failed' | null>(null);

  const handleOpenDialog = (request: TopUpRequest, action: 'success' | 'failed' | 'view') => {
    setSelectedRequest(request);
    setActionType(action === 'view' ? null : action);
    setVerificationNotes('');
    setIsVerifyDialogOpen(true);
  };

  const handleVerify = async () => {
    if (!selectedRequest || !actionType) return;
    
    try {
      await verifyTopUp({
        id: selectedRequest.id,
        status: actionType,
        notes: verificationNotes,
      }).unwrap();
      
      toast.success(`Berhasil ${actionType === 'success' ? 'menyetujui' : 'menolak'} top-up`);
      setIsVerifyDialogOpen(false);
      setSelectedRequest(null);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Terjadi kesalahan saat verifikasi server.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">Sukses</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400">Gagal / Ditolak</Badge>;
      case 'waiting_verification':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400">Menunggu Verifikasi</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300">{status}</Badge>;
    }
  };

  const columns: ColumnDef<TopUpRequest>[] = [
    {
      accessorKey: 'created_at',
      header: 'Tanggal Request',
      cell: ({ row }) => format(new Date(row.original.created_at), 'dd MMM yyyy HH:mm', { locale: id }),
    },
    {
      accessorKey: 'account_number',
      header: 'No. Rekening (NIS)',
      cell: ({ row }) => <span className="font-mono">{row.original.account_number}</span>,
    },
    {
      accessorKey: 'channel',
      header: 'Kanal',
      cell: ({ row }) => (
        <span className="capitalize">
          {row.original.channel === 'bank_transfer' ? 'Transfer Bank' : row.original.channel === 'cash' ? 'Kasir Tunai' : row.original.channel}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Nominal',
      cell: ({ row }) => <span className="font-semibold text-primary">{formatCurrency(parseFloat(row.original.amount))}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const topUp = row.original;
        const isPending = topUp.status === 'waiting_verification';

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenDialog(topUp, 'view')}
              title="Lihat Detail"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {isPending && (
              <>
                <Button
                  variant="success"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleOpenDialog(topUp, 'success')}
                  title="Terima / Verifikasi"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" /> ACC
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleOpenDialog(topUp, 'failed')}
                  title="Tolak"
                >
                  <XCircle className="h-4 w-4 mr-1" /> Tolak
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const getProofUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_BANK_WEB_URL || 'http://localhost:8001';
    return `${baseUrl}/storage/${path}`;
  };

  return (
    <DashboardLayout title="Verifikasi Top-Up" role="administrasi">
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
              <ArrowRightLeft className="h-8 w-8" />
              Verifikasi Top-Up
            </h1>
            <p className="text-muted-foreground mt-1">Antrean validasi penyetoran saldo oleh transfer bank atau kanal lainnya.</p>
          </div>
        </div>

        <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-4">
          {isLoading ? (
            <TableLoadingSkeleton numRows={5} numCols={6} />
          ) : (
            <DataTable
              columns={columns}
              data={data?.data || []}
              pageCount={data?.last_page || -1}
              pagination={pagination}
              onPaginationChange={setPagination}
              isLoading={isFetching}
            />
          )}
        </div>

        <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
          <DialogContent className="sm:max-w-md md:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {actionType === 'success' ? 'Verifikasi & Terima Top-Up' : 
                 actionType === 'failed' ? 'Tolak Top-Up' : 'Detail Permintaan Top-Up'}
              </DialogTitle>
              <DialogDescription>
                Tinjau bukti pembayaran dengan teliti sebelum memberikan keputusan.
              </DialogDescription>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg border">
                  <div>
                    <p className="text-muted-foreground">No. Rekening (NIS)</p>
                    <p className="font-bold">{selectedRequest.account_number}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Nominal Pengajuan</p>
                    <p className="font-bold text-lg text-primary">{formatCurrency(parseFloat(selectedRequest.amount))}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Kanal</p>
                    <p className="font-medium capitalize">{selectedRequest.channel.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tanggal Waktu</p>
                    <p className="font-medium">{format(new Date(selectedRequest.created_at), 'dd MMMM yyyy HH:mm', { locale: id })}</p>
                  </div>
                  {selectedRequest.notes && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Catatan Pengirim</p>
                      <p className="font-medium italic">"{selectedRequest.notes}"</p>
                    </div>
                  )}
                </div>

                {selectedRequest.payment_proof && selectedRequest.channel === 'bank_transfer' && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Bukti Transfer:</p>
                    <div className="border rounded-md overflow-hidden bg-muted/20 flex justify-center items-center min-h-[200px]">
                      <img 
                        src={getProofUrl(selectedRequest.payment_proof)} 
                        alt="Bukti Transfer" 
                        className="max-h-[400px] max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Gambar+Tidak+Ditemukan';
                        }}
                      />
                    </div>
                  </div>
                )}

                {actionType && (
                  <div className="space-y-2 mt-4">
                    <p className="text-sm font-semibold">Catatan Verifikasi (Wajib jika ditolak, Opsional jika diterima):</p>
                    <Textarea
                      placeholder="Masukkan alasan atau catatan..."
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="mt-6 flex gap-2 justify-end sm:justify-end">
              <Button variant="outline" onClick={() => setIsVerifyDialogOpen(false)}>
                {actionType ? 'Batal' : 'Tutup'}
              </Button>
              
              {actionType === 'success' && (
                <Button 
                  onClick={handleVerify} 
                  disabled={isVerifying}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isVerifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  Konfirmasi Terima Saldo
                </Button>
              )}
              
              {actionType === 'failed' && (
                <Button 
                  variant="danger" 
                  onClick={handleVerify} 
                  disabled={isVerifying || !verificationNotes.trim()}
                >
                  {isVerifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                  Konfirmasi Tolak Top-Up
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default TopUpVerificationPage;
