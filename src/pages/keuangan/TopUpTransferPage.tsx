import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useBankTransferTopUpMutation } from '@/store/slices/topUpApi';
import { useGetByAccountNumberQuery } from '@/store/slices/accountApi';
import { toast } from 'react-toastify';
import { Loader2, Search, SmartphoneNfc, UploadCloud } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useGetPaymentPackagesQuery } from '@/store/slices/paymentPackageApi';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { formatCurrency } from '@/utils/formatCurrency';

const transferTopUpSchema = z.object({
  account_number: z.string().min(1, 'Nomor rekening / NIS wajib diisi'),
  payment_package_id: z.string().min(1, 'Harap pilih paket pembayaran'),
  amount: z.number({ invalid_type_error: 'Nominal tidak valid' }).min(1000, 'Minimal transfer Rp 1.000'),
  notes: z.string().optional(),
});

type TransferTopUpFormValues = z.infer<typeof transferTopUpSchema>;

const TopUpTransferPage = () => {
  const [transferTopUp, { isLoading: isSubmitting }] = useBankTransferTopUpMutation();
  const [searchAccount, setSearchAccount] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { data: accountData, isFetching: isSearching } = useGetByAccountNumberQuery(
    searchAccount,
    { skip: searchAccount.length < 3 }
  );

  const { data: packagesData, isLoading: isLoadingPackages } = useGetPaymentPackagesQuery({ is_active: true, per_page: 50 });

  const form = useForm<TransferTopUpFormValues>({
    resolver: zodResolver(transferTopUpSchema),
    defaultValues: {
      account_number: '',
      payment_package_id: '',
      amount: 0,
      notes: 'Top-Up Transfer Bank',
    },
  });

  const onSubmit = async (data: TransferTopUpFormValues) => {
    try {
      if (!accountData?.data) {
        toast.error('Gagal memverifikasi nomor rekening tujuan.');
        return;
      }
      
      if (!selectedFile) {
        toast.error('Bukti transfer wajib diunggah.');
        return;
      }

      await transferTopUp({
        account_number: data.account_number,
        payment_package_id: data.payment_package_id,
        amount: data.amount,
        notes: data.notes,
        payment_proof: selectedFile,
      }).unwrap();
      
      toast.success('Bukti transfer berhasil dikirim. Menunggu verifikasi Admin.');
      
      form.reset({
        account_number: '',
        payment_package_id: '',
        amount: 0,
        notes: 'Top-Up Transfer Bank',
      });
      setSearchAccount('');
      setSelectedFile(null);
      // Reset file input manually
      const fileInput = document.getElementById('payment_proof') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      toast.error(error?.data?.message || 'Terjadi kesalahan saat mengirim bukti transfer.');
    }
  };

  const handleSearch = () => {
    const nip = form.getValues('account_number');
    if (nip) {
      setSearchAccount(nip);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Basic validation
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 2MB');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  return (
    <DashboardLayout title="Top-Up Transfer Bank" role="administrasi">
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
              <SmartphoneNfc className="h-8 w-8" />
              Top-Up via Transfer Bank
            </h1>
            <p className="text-muted-foreground mt-1">Unggah bukti transfer untuk mengisi saldo rekening santri.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="order-2 md:order-1">
            <CardHeader>
              <CardTitle>Form Konfirmasi Transfer</CardTitle>
              <CardDescription>Pastikan nama dan nomor rekening sesuai sebelum mengunggah bukti.</CardDescription>
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
                        <FormLabel>Paket Pembayaran <span className="text-red-500">*</span></FormLabel>
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
                              <SelectValue placeholder={isLoadingPackages ? "Memuat paket..." : "Pilih paket yang dituju"} />
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

                  <div className="space-y-2">
                    <FormLabel>Bukti Transfer <span className="text-red-500">*</span></FormLabel>
                    <div className="border border-dashed border-primary/30 rounded-lg p-6 bg-muted/20 flex flex-col items-center justify-center text-center">
                      <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-2">Unggah tangkapan layar (screenshot) transfer bank</p>
                      <p className="text-xs text-muted-foreground mb-4 opacity-70">Format: JPG, PNG maksimal 2MB</p>
                      <Input 
                        id="payment_proof"
                        type="file" 
                        accept="image/jpeg,image/png,image/webp" 
                        onChange={handleFileChange}
                        className="max-w-xs cursor-pointer text-sm"
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nominal Transfer (Rp)</FormLabel>
                        <FormControl>
                          <Input 
                            type="text" 
                            placeholder="Nominal sesuai bukti transfer" 
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
                        <FormLabel>Keterangan Pengirim (Opsional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Misal: Top up SPP bulanan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isSubmitting || !accountData?.data || !selectedFile}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengunggah...
                      </>
                    ) : (
                      "Kirim Bukti Transfer"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Info Pemilik Rekening Card */}
          <Card className="bg-muted/40 border-primary/20 order-1 md:order-2">
            <CardHeader>
              <CardTitle className="text-lg">Detail Penerima</CardTitle>
            </CardHeader>
            <CardContent>
              {isSearching ? (
                <div className="flex justify-center items-center py-8 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" /> Menarik data...
                </div>
              ) : accountData?.data ? (
                <div className="space-y-4">
                  <div className="p-4 bg-background rounded-lg border shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Nomor Rekening</p>
                    <p className="text-xl font-bold font-mono tracking-wider">{accountData.data.account_number}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Nama Santri</p>
                      <p className="font-semibold">{accountData.data.student ? `${accountData.data.student.first_name || ''} ${accountData.data.student.last_name || ''}`.trim() : 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Kamar / Asrama</p>
                      <p className="font-medium">
                        {accountData.data.student?.current_room?.hostel_name || '-'} - {accountData.data.student?.current_room?.room_name || '-'}
                      </p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-xs text-muted-foreground">Status Rekening</p>
                      <p className="font-medium text-green-600 dark:text-green-400">Aktif & Siap Menerima Dana</p>
                    </div>
                  </div>
                </div>
              ) : searchAccount ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground bg-background rounded-lg border border-dashed">
                  <p className="text-center">NIS <strong>{searchAccount}</strong> tidak ditemukan.</p>
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center py-10 text-muted-foreground opacity-60">
                  <p className="text-center text-sm">Cari NIS terlebih dahulu untuk<br/>menampilkan data santri penerima.</p>
                </div>
              )}

              <div className="mt-8 border-t pt-6">
                <h4 className="font-semibold text-sm mb-3 text-muted-foreground">Informasi Rekening Bank Tujuan</h4>
                <div className="space-y-3 bg-primary/5 p-4 rounded-lg border border-primary/10">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Bank</span>
                    <span className="font-bold">BSI (Bank Syariah Indonesia)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Nomor Rekening</span>
                    <span className="font-bold font-mono text-primary text-base">712 345 6789</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Atas Nama</span>
                    <span className="font-bold">Yayasan Pesantren</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TopUpTransferPage;
