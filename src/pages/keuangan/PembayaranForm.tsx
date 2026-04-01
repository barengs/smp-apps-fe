import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCreatePaymentMutation } from '@/store/slices/paymentApi';
import { useGetPaymentPackagesQuery } from '@/store/slices/paymentPackageApi';
import { accountApi } from '@/store/slices/accountApi';
import * as toast from '@/utils/toast';
import { formatCurrency } from '@/utils/formatCurrency';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  account_number: z.string().min(1, 'NIS Santri wajib diisi'),
  package_id: z.string().min(1, 'Pilih paket pembayaran'),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PembayaranFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const PembayaranForm: React.FC<PembayaranFormProps> = ({ isOpen, onClose }) => {
  const [triggerGetAccount, { data: accountData, isFetching: isFetchingAccount, isError: isAccountError }] = 
    accountApi.useLazyGetAccountByIdQuery();
  
  const { data: packagesData, isLoading: isPackagesLoading } = useGetPaymentPackagesQuery({ is_active: true });
  const [createPayment, { isLoading: isCreating }] = useCreatePaymentMutation();

  const [nisInput, setNisInput] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account_number: '',
      package_id: '',
      notes: '',
    },
  });

  const selectedPackageId = form.watch('package_id');
  const selectedPackage = packagesData?.data.find(p => p.id.toString() === selectedPackageId);

  const handleSearchAccount = () => {
    if (nisInput.trim()) {
      triggerGetAccount(nisInput.trim());
      form.setValue('account_number', nisInput.trim());
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!accountData) {
      toast.showError('Silakan pilih santri terlebih dahulu');
      return;
    }

    const packageAmount = parseFloat(selectedPackage?.total_amount || '0');
    const accountBalance = parseFloat(accountData.balance || '0');

    if (accountBalance < packageAmount) {
      toast.showError('Saldo santri tidak mencukupi untuk paket ini');
      return;
    }

    try {
      await createPayment({
        account_number: values.account_number,
        package_id: parseInt(values.package_id),
        notes: values.notes,
      }).unwrap();
      
      toast.showSuccess('Pembayaran paket berhasil diproses');
      onClose();
      form.reset();
      setNisInput('');
    } catch (err: any) {
      toast.showError(err?.data?.message || 'Gagal memproses pembayaran');
    }
  };

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setNisInput('');
    }
  }, [isOpen, form]);

  const accountInfo = accountData;
  const balance = parseFloat(accountInfo?.balance || '0');
  const packageTotal = parseFloat(selectedPackage?.total_amount || '0');
  const packageSaku = parseFloat(selectedPackage?.saku_amount || '0');
  const actualDebit = packageTotal - packageSaku;

  const isBalanceEnough = balance >= packageTotal;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Proses Pembayaran Paket</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <FormLabel>NIS Santri / No. Rekening</FormLabel>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Masukkan NIS..." 
                    value={nisInput}
                    onChange={(e) => setNisInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchAccount())}
                  />
                  <Button type="button" variant="secondary" onClick={handleSearchAccount} disabled={isFetchingAccount}>
                    {isFetchingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {accountInfo && (
              <div className="bg-slate-50 p-3 rounded-md border flex justify-between items-center text-sm">
                <div>
                  <p className="font-semibold text-slate-900">{accountInfo.customer?.first_name} {accountInfo.customer?.last_name || ''}</p>
                  <p className="text-xs text-slate-500">{accountInfo.account_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Saldo Saat Ini</p>
                  <p className="font-bold text-blue-600">{formatCurrency(balance)}</p>
                </div>
              </div>
            )}

            {isAccountError && !isFetchingAccount && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Santri dengan NIS tersebut tidak ditemukan atau rekening tidak aktif.</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="package_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilih Paket Pembayaran</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih paket..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {packagesData?.data.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.package_name} ({formatCurrency(parseFloat(p.total_amount))})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedPackage && (
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total Tagihan Paket:</span>
                  <span className="font-bold">{formatCurrency(packageTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-blue-600 italic">
                  <span>Alokasi Ke Uang Saku:</span>
                  <span className="font-medium">-{formatCurrency(packageSaku)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-blue-100 text-blue-700">
                  <span className="font-bold">Dana Terpotong (Net):</span>
                  <span className="font-extrabold">{formatCurrency(actualDebit)}</span>
                </div>

                {!isBalanceEnough && accountInfo && (
                  <div className="mt-2 text-red-500 flex items-center gap-1 font-medium animate-pulse">
                    <AlertCircle className="h-4 w-4" />
                    Saldo kurang {formatCurrency(packageTotal - balance)}
                  </div>
                )}
              </div>
            )}

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

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
              <Button 
                type="submit" 
                disabled={isCreating || !accountInfo || !selectedPackage || !isBalanceEnough}
                className="bg-green-600 hover:bg-green-700"
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Eksekusi Pembayaran
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PembayaranForm;
