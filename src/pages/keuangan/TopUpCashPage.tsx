import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCashTopUpMutation } from '@/store/slices/topUpApi';
import { useGetByAccountNumberQuery } from '@/store/slices/accountApi';
import { toast } from 'react-toastify';
import { Loader2, Search, Wallet } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useGetPaymentPackagesQuery } from '@/store/slices/paymentPackageApi';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const cashTopUpSchema = z.object({
  account_number: z.string().min(1, 'Nomor rekening / NIS wajib diisi'),
  payment_package_id: z.string().min(1, 'Harap pilih paket pembayaran'),
  amount: z.number({ invalid_type_error: 'Nominal tidak valid' }).min(1000, 'Minimal top-up Rp 1.000'),
  notes: z.string().optional(),
});

type CashTopUpFormValues = z.infer<typeof cashTopUpSchema>;

const TopUpCashPage = () => {
  const [cashTopUp, { isLoading: isSubmitting }] = useCashTopUpMutation();
  const [searchAccount, setSearchAccount] = useState('');
  
  // Use debounce or manual trigger for account search if needed
  const { data: accountData, isFetching: isSearching } = useGetByAccountNumberQuery(
    searchAccount,
    { skip: searchAccount.length < 3 }
  );

  const { data: packagesData, isLoading: isLoadingPackages } = useGetPaymentPackagesQuery({ is_active: true, per_page: 50 });

  const form = useForm<CashTopUpFormValues>({
    resolver: zodResolver(cashTopUpSchema),
    defaultValues: {
      account_number: '',
      payment_package_id: '',
      amount: 0,
      notes: 'Top-Up Tunai via Kasir',
    },
  });

  const onSubmit = async (data: CashTopUpFormValues) => {
    try {
      if (!accountData?.data) {
        toast.error('Gagal memverifikasi nomor rekening tujuan.');
        return;
      }

      await cashTopUp({
        account_number: data.account_number,
        payment_package_id: data.payment_package_id,
        amount: data.amount,
        notes: data.notes,
      }).unwrap();
      toast.success('Setor Tunai Top-Up berhasil dicatat dan diproses!');
      
      form.reset({
        account_number: '',
        payment_package_id: '',
        amount: 0,
        notes: 'Top-Up Tunai via Kasir',
      });
      setSearchAccount('');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Terjadi kesalahan saat melakukan setor tunai.');
    }
  };

  const handleSearch = () => {
    const nip = form.getValues('account_number');
    if (nip) {
      setSearchAccount(nip);
    }
  };

  return (
    <DashboardLayout title="Setor Tunai" role="administrasi">
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
              <Wallet className="h-8 w-8" />
              Setor Tunai (Kasir)
            </h1>
            <p className="text-muted-foreground mt-1">Layanan penerimaan uang tunai untuk top-up saldo santri secara langsung.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Setoran Tunai</CardTitle>
              <CardDescription>Masukkan nomor rekening (NIS) dan nominal setoran secara akurat.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <div className="flex gap-2 items-end">
                    <FormField
                      control={form.control}
                      name="account_number"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Nomor Rekening / NIS</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan NIS Santri" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="secondary" onClick={handleSearch} disabled={isSearching}>
                      {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name="payment_package_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pilih Paket Pembayaran</FormLabel>
                        <Select 
                          onValueChange={(val) => {
                            field.onChange(val);
                            // Auto-fill amount from package
                            const pkg = packagesData?.data?.find(p => p.id.toString() === val);
                            if (pkg) {
                              form.setValue('amount', parseFloat(pkg.total_amount));
                            }
                          }} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={isLoadingPackages ? "Memuat paket..." : "Pilih paket yang akan dibayar"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {packagesData?.data?.map((pkg) => (
                              <SelectItem key={pkg.id} value={pkg.id.toString()}>
                                {pkg.package_name} - {formatCurrency(parseFloat(pkg.total_amount))}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nominal Setoran (Rp)</FormLabel>
                        <FormControl>
                          <Input 
                            type="text" 
                            placeholder="Contoh: 50.000" 
                            {...field} 
                            value={field.value ? new Intl.NumberFormat('id-ID').format(field.value) : ''}
                            onChange={(e) => {
                              const rawValue = e.target.value.replace(/[^0-9]/g, '');
                              field.onChange(rawValue ? parseInt(rawValue, 10) : 0);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catatan (Opsional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Keterangan tambahan..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isSubmitting || !accountData?.data}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sedang Memproses...
                      </>
                    ) : (
                      "Proses Setor Tunai"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Info Pemilik Rekening Card */}
          <Card className="bg-muted/40 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Informasi Rekening</CardTitle>
            </CardHeader>
            <CardContent>
              {isSearching ? (
                <div className="flex justify-center items-center py-8 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" /> Mencari data rekening...
                </div>
              ) : accountData?.data ? (
                <div className="space-y-4">
                  <div className="p-4 bg-background rounded-lg border shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Nomor Rekening</p>
                    <p className="text-xl font-bold font-mono tracking-wider">{accountData.data.account_number}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Nama Pemilik</p>
                      <p className="font-semibold">{accountData.data.customer ? `${accountData.data.customer.first_name || ''} ${accountData.data.customer.last_name || ''}`.trim() : 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Produk Tabungan</p>
                      <p className="font-medium">{accountData.data.product?.product_name || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Status Rekening</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${accountData.data.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {accountData.data.status === 'active' ? 'Aktif' : 'Terblokir'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Saldo Saat Ini</p>
                      <p className="font-bold text-primary">{formatCurrency(parseFloat(accountData.data.balance.toString()))}</p>
                    </div>
                  </div>
                  
                  {accountData.data.status !== 'active' && (
                    <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md text-sm border border-red-200 dark:border-red-800/30">
                      <strong>Peringatan:</strong> Rekening dalam status tidak aktif. Transaksi top-up mungkin ditolak oleh sistem.
                    </div>
                  )}
                </div>
              ) : searchAccount ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground bg-background rounded-lg border border-dashed">
                  <Search className="h-8 w-8 mb-2 opacity-20" />
                  <p>Rekening dengan NIS <strong>{searchAccount}</strong> tidak ditemukan.</p>
                  <p className="text-xs mt-1 text-center px-4">Pastikan Anda memasukkan nomor rekening atau NIS yang valid dan telah didaftarkan di Bank Santri.</p>
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center py-10 text-muted-foreground opacity-60">
                  <Wallet className="h-12 w-12 mb-3 opacity-20" />
                  <p className="text-center text-sm">Masukkan Nomor Rekening / NIS lalu<br/>klik tombol pencarian untuk memverifikasi.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TopUpCashPage;
