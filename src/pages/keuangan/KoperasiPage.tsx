import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  QrCode, 
  ShoppingCart, 
  CheckCircle2, 
  User, 
  Wallet,
  Receipt,
  ArrowLeft,
  Loader2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useCheckNisQuery, useDebitKoperasiMutation } from '@/store/slices/koperasiApi';
import { formatCurrency } from '@/utils/formatCurrency';
import * as toast from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const KoperasiPage: React.FC = () => {
  const [nisInput, setNisInput] = useState('');
  const [amountInput, setAmountInput] = useState<number | ''>('');
  const [itemDescription, setItemDescription] = useState('');
  const [lastReceipt, setLastReceipt] = useState<any>(null);

  const { data: santriData, isFetching: isChecking, isError, error, refetch } = useCheckNisQuery(nisInput, {
    skip: !nisInput || nisInput.length < 3,
  });

  const [debitKoperasi, { isLoading: isProcessing }] = useDebitKoperasiMutation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (nisInput.length >= 3) {
      refetch();
    }
  };

  const handleProcessTransaction = async () => {
    if (!santriData || !amountInput || amountInput <= 0) return;

    try {
      const result = await debitKoperasi({
        account_number: santriData.account_number,
        amount: Number(amountInput),
        item_description: itemDescription,
        outlet_name: 'Koperasi Utama Pesantren',
      }).unwrap();

      setLastReceipt(result.data);
      toast.showSuccess('Pembayaran Berhasil');
      
      // Reset state for next customer
      setAmountInput('');
      setItemDescription('');
    } catch (err: any) {
      toast.showError(err?.data?.message || 'Gagal memproses transaksi');
    }
  };

  const breadcrumbItems = [
    { label: 'Bank Santri' },
    { label: 'Kasir Koperasi' },
  ];

  return (
    <DashboardLayout title="Kasir Koperasi (Cashless)" role="administrasi">
      <CustomBreadcrumb items={breadcrumbItems} />
      
      <div className="container mx-auto mt-4 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Sisi Kiri: Input Pelanggan */}
          <div className="space-y-6">
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-slate-50 dark:bg-slate-900/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Cek Pelanggan
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      className="pl-10 text-lg font-bold" 
                      placeholder="Scan Kartu atau Ketik NIS..." 
                      value={nisInput}
                      onChange={(e) => setNisInput(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <Button size="lg" disabled={isChecking} type="submit">
                    {isChecking ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Search className="h-5 w-5 mr-2" />}
                    Cek
                  </Button>
                </form>

                {isError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {(error as any)?.data?.message || 'Data santri tidak ditemukan.'}
                  </div>
                )}

                {santriData && (
                  <div className="mt-6 flex flex-col md:flex-row gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-slate-200 overflow-hidden shrink-0 shadow-sm">
                      {santriData.student?.photo ? (
                        <img src={santriData.student.photo} alt="Student" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-10 w-10 text-slate-400" />
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">{santriData.customer_name}</h3>
                      <div className="flex gap-2 items-center">
                        <Badge variant="outline" className="text-xs bg-slate-100 dark:bg-slate-800 border-none font-mono">{santriData.account_number}</Badge>
                        <Badge variant="success" className="text-[10px] py-0">Aktif</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-800">
                          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Saldo Tabungan</p>
                          <p className="text-lg font-black text-blue-700 dark:text-blue-300">{formatCurrency(parseFloat(santriData.balance))}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {santriData && (
              <Card className="border-2 shadow-lg border-primary/20 animate-in fade-in zoom-in-95 duration-500">
                <CardHeader className="bg-primary/5 dark:bg-primary/10">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    Transaksi Baru
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Nominal Belanja (Rp)</label>
                    <Input 
                      type="number" 
                      className="text-4xl h-20 font-black text-center text-primary" 
                      placeholder="0"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value ? Number(e.target.value) : '')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Deskripsi Barang (Opsional)</label>
                    <Input 
                      placeholder="Cth: Jajan, Alat Tulis, dll."
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="pb-6">
                  <Button 
                    className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90"
                    disabled={isProcessing || !amountInput || amountInput <= 0 || amountInput > parseFloat(santriData.balance)}
                    onClick={handleProcessTransaction}
                  >
                    {isProcessing ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <CheckCircle2 className="h-6 w-6 mr-3" />}
                    BAYAR SEKARANG
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>

          {/* Sisi Kanan: Struk Terakhir / Receipt */}
          <div className="space-y-6">
            {lastReceipt ? (
              <Card className="border-4 border-slate-900 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                <CardContent className="p-0">
                  <div className="bg-slate-900 text-white p-6 text-center space-y-2">
                    <Receipt className="h-10 w-10 mx-auto text-primary" />
                    <h2 className="text-2xl font-black tracking-tighter">BUKTI TRANSAKSI</h2>
                    <p className="text-xs text-slate-400 uppercase tracking-[0.2em]">KOPERASI PUSAT PESANTREN</p>
                  </div>
                  
                  <div className="p-8 space-y-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">No. Referensi</span>
                        <span className="font-mono font-bold tracking-tighter">{lastReceipt.reference_number}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Waktu</span>
                        <span className="font-medium">{lastReceipt.transaction_time}</span>
                      </div>
                      <Separator className="bg-slate-200 dark:bg-slate-800" />
                      <div className="flex justify-between items-center py-2">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Detail Pelanggan</p>
                          <p className="font-black text-lg">{lastReceipt.customer_name}</p>
                          <p className="text-xs font-mono">{lastReceipt.account_number}</p>
                        </div>
                      </div>
                      <Separator className="bg-slate-200 dark:bg-slate-800 border-dashed" />
                      <div className="space-y-2 py-4">
                        <div className="flex justify-between items-center italic text-sm">
                          <span>{lastReceipt.item_description || 'Belanja Koperasi'}</span>
                          <span>1x</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-4 border-t-2 border-slate-900 dark:border-slate-100">
                          <span className="text-2xl font-black">TOTAL</span>
                          <span className="text-3xl font-black text-primary">{formatCurrency(parseFloat(lastReceipt.amount))}</span>
                        </div>
                      </div>
                      <Separator className="bg-slate-200 dark:bg-slate-800" />
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                          <p className="text-muted-foreground pb-1">Saldo Awal</p>
                          <p className="font-bold">{formatCurrency(parseFloat(lastReceipt.balance_before))}</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                          <p className="text-muted-foreground pb-1">Saldo Akhir</p>
                          <p className="font-bold text-primary">{formatCurrency(parseFloat(lastReceipt.balance_after))}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-center pt-6 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Terima Kasih Atas Pembelian Anda</p>
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=verified" alt="QR Verified" className="mx-auto opacity-20 filter grayscale" width={40} height={40} />
                    </div>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 border-t-2 border-slate-900 dark:border-slate-100 flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setLastReceipt(null)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      KEMBALI
                    </Button>
                    <Button className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      CETAK STRUK
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-full shadow-lg">
                  <Wallet className="h-16 w-16 text-slate-200 dark:text-slate-800" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-400">Belum Ada Transaksi</h3>
                  <p className="text-sm text-slate-400 max-w-[250px] mx-auto">Selesaikan pembayaran pelanggan untuk melihat rincian nota atau struk di sini.</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default KoperasiPage;
