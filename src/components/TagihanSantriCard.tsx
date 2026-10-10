import React, { useState } from 'react';
import { useGetBillsByAccountQuery, usePayBillsCashMutation } from '@/store/slices/bankApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import * as toast from '@/utils/toast';
import { AlertCircle, Banknote, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TagihanSantriCardProps {
  accountNumber: string;
}

const formatRp = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0);
};

export function TagihanSantriCard({ accountNumber }: TagihanSantriCardProps) {
  const { data: billsResponse, isLoading } = useGetBillsByAccountQuery(accountNumber);
  const [payBillsCash, { isLoading: isPaying }] = usePayBillsCashMutation();

  const billsData = billsResponse?.data;
  const bills = billsData?.bills || [];
  const unpaidBills = bills.filter(b => ['unpaid', 'partial', 'overdue'].includes(b.status)).sort((a, b) => a.id - b.id);

  const [selectedBillIds, setSelectedBillIds] = useState<number[]>([]);

  // Function to ensure continuous selection (FIFO)
  const handleToggleBill = (billId: number, checked: boolean) => {
    if (checked) {
      // Find the index of the clicked bill in the unpaid bills list
      const billIndex = unpaidBills.findIndex(b => b.id === billId);
      // Select all bills up to this index
      const newSelected = unpaidBills.slice(0, billIndex + 1).map(b => b.id);
      setSelectedBillIds(newSelected);
    } else {
      // Find the index and unselect it and everything after it
      const billIndex = unpaidBills.findIndex(b => b.id === billId);
      const newSelected = unpaidBills.slice(0, billIndex).map(b => b.id);
      setSelectedBillIds(newSelected);
    }
  };

  const handlePayCash = async () => {
    if (selectedBillIds.length === 0) return;

    try {
      const res = await payBillsCash({
        account_number: accountNumber,
        bill_ids: selectedBillIds,
        notes: 'Pelunasan tunai via kasir',
      }).unwrap();

      toast.showSuccess(res.message);
      setSelectedBillIds([]); // Reset selection
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string } } | undefined;
      const errorMessage = errObj?.data?.message || 'Terjadi kesalahan saat memproses pembayaran';
      toast.showError(errorMessage);
    }
  };

  const totalSelectedAmount = unpaidBills
    .filter(b => selectedBillIds.includes(b.id))
    .reduce((sum, b) => sum + b.remaining, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Ringkasan Tunggakan */}
      {billsData?.has_arrears ? (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Santri Menunggak Tagihan</AlertTitle>
          <AlertDescription className="text-red-700">
            Total tunggakan: <strong>{formatRp(billsData.total_arrears)}</strong> ({billsData.overdue_months_count} bulan).
          </AlertDescription>
        </Alert>
      ) : bills.length > 0 ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Status Keuangan Tertib</AlertTitle>
          <AlertDescription className="text-green-700">
            Tidak ada tagihan jatuh tempo yang tertunggak.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">Sisa Tagihan / Tunggakan</div>
            <div className="text-2xl font-bold mt-1 text-red-600">{formatRp(billsData?.total_unpaid_all || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">Total Dibayar (Terpilih)</div>
            <div className="text-2xl font-bold mt-1 text-blue-600">{formatRp(totalSelectedAmount)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daftar Tagihan Belum Lunas</CardTitle>
          <CardDescription>Pilih bulan tagihan yang ingin dibayar tunai. Sistem mewajibkan pelunasan dari bulan tertua secara berurutan.</CardDescription>
        </CardHeader>
        <CardContent>
          {unpaidBills.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              Tidak ada tagihan yang belum dibayar.
            </div>
          ) : (
            <div className="space-y-4">
              {unpaidBills.map((bill) => (
                <div 
                  key={bill.id} 
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${selectedBillIds.includes(bill.id) ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                >
                  <div className="flex items-center space-x-4">
                    <Checkbox 
                      id={`bill-${bill.id}`} 
                      checked={selectedBillIds.includes(bill.id)}
                      onCheckedChange={(checked) => handleToggleBill(bill.id, checked as boolean)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label 
                        htmlFor={`bill-${bill.id}`} 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Periode {bill.period}
                        {bill.is_overdue && <Badge variant="destructive" className="ml-2 text-[10px] h-4">Jatuh Tempo</Badge>}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Sisa tagihan: <span className="font-semibold text-foreground">{formatRp(bill.remaining)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Tagihan</div>
                    <div className="font-medium">{formatRp(bill.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {unpaidBills.length > 0 && (
          <CardFooter className="bg-muted/30 py-4 flex items-center justify-between border-t">
            <div>
              <p className="text-sm font-medium">Total Pembayaran Tunai:</p>
              <p className="text-lg font-bold text-primary">{formatRp(totalSelectedAmount)}</p>
            </div>
            <Button 
              size="lg" 
              onClick={handlePayCash} 
              disabled={selectedBillIds.length === 0 || isPaying}
            >
              <Banknote className="mr-2 h-4 w-4" />
              {isPaying ? 'Memproses...' : 'Bayar Tunai di Kasir'}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
