import React, { useState } from 'react';
import WaliSantriLayout from '@/layouts/WaliSantriLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import {
  useGetSantriByParentNikQuery,
  useGetProfileDetailsQuery,
  useGetStudentFinanceQuery,
  useGetStudentPaymentPackagesQuery,
  useGetStudentAddonItemsQuery,
  useGetStudentTopUpHistoryQuery,
  useSubmitStudentTopUpMutation,
  Santri,
  PaymentPackage,
  AddonItem,
  TopUpHistoryItem,
} from '@/store/slices/authApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Upload,
  AlertCircle,
  FileText,
  CreditCard,
  Building2,
  Info,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import * as toast from '@/utils/toast';

const formatRp = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

const TransaksiPage: React.FC = () => {
  const currentUser = useSelector(selectCurrentUser);
  const storedNik = currentUser?.profile?.nik;

  const { data: profileData, isLoading: isProfileLoading } = useGetProfileDetailsQuery(undefined, {
    skip: !!storedNik,
  });

  const nik = storedNik || profileData?.data?.profile?.nik;

  const { data: santriData, isLoading: isSantriLoading } = useGetSantriByParentNikQuery(nik || '', {
    skip: !nik,
  });

  const students: Santri[] = santriData?.data?.student || [];
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const currentStudent = students.find((s) => String(s.id) === selectedStudentId) || students[0];
  const activeStudentId = currentStudent ? String(currentStudent.id) : '';

  // Data Keuangan & Mutasi
  const { data: financeResponse, isLoading: isFinanceLoading } = useGetStudentFinanceQuery(activeStudentId, {
    skip: !activeStudentId,
  });

  // Data Paket Pembayaran & Addon
  const { data: packagesResponse } = useGetStudentPaymentPackagesQuery(activeStudentId, {
    skip: !activeStudentId,
  });

  const { data: addonsResponse } = useGetStudentAddonItemsQuery(activeStudentId, {
    skip: !activeStudentId,
  });

  // Riwayat Pengajuan Top-Up
  const { data: topUpHistoryResponse, isLoading: isHistoryLoading } = useGetStudentTopUpHistoryQuery(activeStudentId, {
    skip: !activeStudentId,
  });

  const [submitTopUp, { isLoading: isSubmitting }] = useSubmitStudentTopUpMutation();

  // Form State
  const [topUpType, setTopUpType] = useState<'free' | 'package'>('free');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedAddonIds, setSelectedAddonIds] = useState<number[]>([]);
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [proofFile, setProofFile] = useState<File | null>(null);

  const account = financeResponse?.data?.account;
  const transactions = financeResponse?.data?.transactions || [];

  // Parse list paket
  const rawPackages = packagesResponse?.data;
  const packagesList: PaymentPackage[] = Array.isArray(rawPackages)
    ? rawPackages
    : (rawPackages as { data?: PaymentPackage[] })?.data || [];

  // Parse list addons
  const addonsList: AddonItem[] = addonsResponse?.data || [];

  // Parse riwayat top-up
  const rawHistory = topUpHistoryResponse?.data;
  const historyList: TopUpHistoryItem[] = Array.isArray(rawHistory)
    ? rawHistory
    : (rawHistory as { data?: TopUpHistoryItem[] })?.data || [];

  // Handle pilih paket pembayaran
  const handleSelectPackage = (packageIdStr: string) => {
    setSelectedPackageId(packageIdStr);
    const selectedPkg = packagesList.find((p) => String(p.id) === packageIdStr);
    if (selectedPkg) {
      setAmount(String(selectedPkg.total_amount));
    }
  };

  const handleToggleAddon = (addonId: number, addonAmount: number) => {
    if (selectedAddonIds.includes(addonId)) {
      setSelectedAddonIds(selectedAddonIds.filter((id) => id !== addonId));
      setAmount((prev) => String(Math.max(0, (Number(prev) || 0) - addonAmount)));
    } else {
      setSelectedAddonIds([...selectedAddonIds, addonId]);
      setAmount((prev) => String((Number(prev) || 0) + addonAmount));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeStudentId) {
      toast.showError('Silakan pilih data santri terlebih dahulu.');
      return;
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount < 10000) {
      toast.showError('Nominal transfer minimal adalah Rp 10.000.');
      return;
    }

    if (!proofFile) {
      toast.showError('Mohon unggah foto atau file bukti transfer bank.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('amount', String(numAmount));
      formData.append('payment_proof', proofFile);
      if (notes) formData.append('notes', notes);
      if (topUpType === 'package' && selectedPackageId) {
        formData.append('payment_package_id', selectedPackageId);
      }
      if (selectedAddonIds.length > 0) {
        selectedAddonIds.forEach((id) => formData.append('addon_item_ids[]', String(id)));
      }

      const res = await submitTopUp({ id: activeStudentId, formData }).unwrap();
      toast.showSuccess(res.message || 'Bukti transfer berhasil dikirim. Menunggu verifikasi admin.');

      // Reset form
      setAmount('');
      setNotes('');
      setProofFile(null);
      setSelectedPackageId('');
      setSelectedAddonIds([]);
    } catch (err: unknown) {
      const msg =
        (err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined) || 'Gagal mengajukan top-up. Silakan periksa kembali berkas transfer Anda.';
      toast.showError(msg);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Berhasil
          </Badge>
        );
      case 'waiting_verification':
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
            <Clock className="h-3 w-3 mr-1" /> Menunggu Verifikasi
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
            <XCircle className="h-3 w-3 mr-1" /> Ditolak
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isLoading = isProfileLoading || isSantriLoading;

  return (
    <WaliSantriLayout title="Topup / Transfer Dana" role="wali-santri">
      <div className="space-y-6">
        {/* Header & Santri Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Topup Saldo & Transfer Dana
            </h1>
            <p className="text-muted-foreground text-sm">
              Pengisian saldo tabungan uang saku santri dan pembayaran paket biaya pendidikan via transfer bank.
            </p>
          </div>

          {students.length > 1 && (
            <div className="w-full sm:w-[260px]">
              <Select
                value={selectedStudentId || String(currentStudent?.id || '')}
                onValueChange={(val) => setSelectedStudentId(val)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Pilih Santri" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.first_name} {s.last_name || ''} ({s.nis})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !currentStudent ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Santri Tidak Ditemukan</AlertTitle>
            <AlertDescription>
              Belum ada data santri yang terhubung dengan akun Wali Santri Anda.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Info Rekening & Rekening Bank Tujuan Pesantren */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-blue-100">
                      Saldo Tabungan Santri
                    </CardTitle>
                    <Wallet className="h-5 w-5 text-blue-200" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">
                    {account ? formatRp(account.balance) : isFinanceLoading ? '...' : 'Rp 0'}
                  </div>
                  <div className="mt-2 text-xs text-blue-100">
                    <p className="font-medium">{currentStudent.first_name} {currentStudent.last_name || ''}</p>
                    <p className="font-mono">NIS / Rek: {currentStudent.nis || '-'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 border-dashed">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                    <CardTitle className="text-base font-semibold">
                      Informasi Rekening Bank Tujuan Transfer
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Kirim transfer ke salah satu rekening resmi pesantren berikut sebelum mengunggah bukti:
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm mt-1">
                    <div className="p-3 bg-slate-50 rounded-lg border">
                      <p className="text-xs text-muted-foreground">Bank Syariah Indonesia (BSI)</p>
                      <p className="font-mono font-bold text-base text-gray-900 mt-0.5">712-3456-789</p>
                      <p className="text-xs text-gray-600 mt-1">a.n. Pesantren Tamjid Utama</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border">
                      <p className="text-xs text-muted-foreground">Bank Muamalat</p>
                      <p className="font-mono font-bold text-base text-gray-900 mt-0.5">101-0023-456</p>
                      <p className="text-xs text-gray-600 mt-1">a.n. Yayasan Pendidikan Pesantren</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulir Pengajuan Top-Up Transfer */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <CardTitle>Formulir Pengajuan Top-Up / Konfirmasi Transfer</CardTitle>
                </div>
                <CardDescription>
                  Isi nominal dan unggah struk/bukti transfer bank untuk diverifikasi oleh staf bendahara.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Pilihan Jenis Top Up */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Tujuan Pembayaran
                    </label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setTopUpType('free');
                          setSelectedPackageId('');
                          setSelectedAddonIds([]);
                        }}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          topUpType === 'free'
                            ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-semibold text-sm text-gray-900">Saldo Bebas (Uang Saku)</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Masuk langsung ke saldo rekening tabungan santri untuk kebutuhan harian.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTopUpType('package')}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          topUpType === 'package'
                            ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-semibold text-sm text-gray-900">Paket Pendidikan / SPP</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Pelunasan paket SPP bulanan atau komponen pendidikan berkala santri.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Pilihan Paket jika topUpType === 'package' */}
                  {topUpType === 'package' && (
                    <div className="p-4 bg-slate-50 rounded-lg border space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                          Pilih Paket Pendidikan
                        </label>
                        {packagesList.length === 0 ? (
                          <p className="text-xs text-muted-foreground">
                            Tidak ada paket pembayaran aktif yang tersedia saat ini.
                          </p>
                        ) : (
                          <Select
                            value={selectedPackageId}
                            onValueChange={(val) => handleSelectPackage(val)}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Pilih Paket Pendidikan..." />
                            </SelectTrigger>
                            <SelectContent>
                              {packagesList.map((pkg) => (
                                <SelectItem key={pkg.id} value={String(pkg.id)}>
                                  {pkg.package_name} — {formatRp(pkg.total_amount)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      {/* Addon Items opsional */}
                      {addonsList.length > 0 && (
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                            Item Tambahan / Fasilitas (Opsional)
                          </label>
                          <div className="space-y-2">
                            {addonsList.map((addon) => {
                              const isChecked = selectedAddonIds.includes(addon.id);
                              return (
                                <label
                                  key={addon.id}
                                  className="flex items-center justify-between p-2.5 bg-white rounded border cursor-pointer hover:bg-slate-50 text-sm"
                                >
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleToggleAddon(addon.id, Number(addon.default_amount))}
                                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                                    />
                                    <span className="font-medium text-gray-800">{addon.item_name}</span>
                                  </div>
                                  <span className="font-semibold text-gray-700">
                                    +{formatRp(addon.default_amount)}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Input Nominal Transfer */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Nominal Transfer (Rp) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500 text-sm font-semibold">
                        Rp
                      </span>
                      <Input
                        type="number"
                        min="10000"
                        placeholder="Contoh: 500000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimal transfer Rp 10.000. Pastikan nominal sesuai dengan mutasi transfer Anda.
                    </p>
                  </div>

                  {/* Unggah Bukti Transfer */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Unggah Bukti Transfer <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        id="proof-upload"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setProofFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                      <label htmlFor="proof-upload" className="cursor-pointer block">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        {proofFile ? (
                          <div className="text-sm font-medium text-blue-600">
                            Berkas terpilih: {proofFile.name} ({Math.round(proofFile.size / 1024)} KB)
                            <p className="text-xs text-gray-500 mt-1">Klik untuk mengganti berkas</p>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-gray-700">
                              Klik untuk memilih foto struk atau file PDF transfer
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Format didukung: JPG, PNG, WEBP, PDF (Maks. 5 MB)
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Catatan / Keterangan */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Catatan / Keterangan (Opsional)
                    </label>
                    <Textarea
                      placeholder="Contoh: Transfer via BSI Mobile a.n. Fulan bin Fulan untuk uang saku pekan ini."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                  </div>

                  {/* Tombol Submit */}
                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white min-w-[160px]"
                    >
                      {isSubmitting ? (
                        'Mengirim Bukti...'
                      ) : (
                        <>
                          <ArrowUpRight className="h-4 w-4 mr-2" /> Kirim Bukti Transfer
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Tabs Riwayat Pengajuan & Mutasi Rekening */}
            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full sm:w-[400px] grid-cols-2 bg-white border">
                <TabsTrigger value="history">Riwayat Pengajuan Top-Up</TabsTrigger>
                <TabsTrigger value="mutation">Mutasi Tabungan</TabsTrigger>
              </TabsList>

              {/* Tab 1: Riwayat Pengajuan Top-Up */}
              <TabsContent value="history" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      Riwayat Pengajuan Top-Up Transfer ({currentStudent.first_name})
                    </CardTitle>
                    <CardDescription>
                      Daftar konfirmasi bukti transfer yang diajukan beserta status verifikasinya.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isHistoryLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : historyList.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                        <Clock className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Belum ada pengajuan top-up yang tercatat.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="border-b text-xs text-muted-foreground uppercase">
                            <tr>
                              <th className="py-3 px-4 text-left">Tanggal</th>
                              <th className="py-3 px-4 text-left">Referensi</th>
                              <th className="py-3 px-4 text-right">Nominal</th>
                              <th className="py-3 px-4 text-center">Status</th>
                              <th className="py-3 px-4 text-left">Catatan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {historyList.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50/50">
                                <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                                  {formatDate(item.created_at)}
                                </td>
                                <td className="py-3 px-4 font-mono font-medium text-xs">
                                  {item.payment_ref}
                                  {item.package && (
                                    <span className="block text-gray-500 font-sans text-xs">
                                      {item.package.package_name}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right font-semibold text-gray-900">
                                  {formatRp(item.amount)}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {getStatusBadge(item.status)}
                                </td>
                                <td className="py-3 px-4 text-xs text-muted-foreground max-w-xs truncate">
                                  {item.notes || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 2: Mutasi Tabungan Santri */}
              <TabsContent value="mutation" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      Mutasi Rekening Tabungan Santri ({currentStudent.first_name})
                    </CardTitle>
                    <CardDescription>
                      Daftar transaksi debit dan kredit yang tercatat di pembukuan bank pesantren.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isFinanceLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : transactions.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                        <Wallet className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Belum ada mutasi transaksi pada rekening ini.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="border-b text-xs text-muted-foreground uppercase">
                            <tr>
                              <th className="py-3 px-4 text-left">Waktu</th>
                              <th className="py-3 px-4 text-left">Tipe / Referensi</th>
                              <th className="py-3 px-4 text-left">Keterangan</th>
                              <th className="py-3 px-4 text-right">Nominal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {transactions.map((tx) => {
                              const isCredit =
                                (tx.direction || '').toLowerCase() === 'credit' ||
                                (tx.direction || '').toLowerCase() === 'in';
                              return (
                                <tr key={tx.id} className="hover:bg-slate-50/50">
                                  <td className="py-3 px-4 whitespace-nowrap text-muted-foreground text-xs">
                                    {formatDate(tx.created_at)}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="font-semibold text-gray-900 block text-xs">
                                      {tx.transaction_type}
                                    </span>
                                    <span className="font-mono text-gray-400 text-xs">
                                      {tx.reference_number || '-'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-xs text-gray-600 max-w-sm">
                                    {tx.description || '-'}
                                  </td>
                                  <td
                                    className={`py-3 px-4 text-right font-semibold ${
                                      isCredit ? 'text-green-600' : 'text-red-600'
                                    }`}
                                  >
                                    {isCredit ? '+' : '-'} {formatRp(tx.amount)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </WaliSantriLayout>
  );
};

export default TransaksiPage;
