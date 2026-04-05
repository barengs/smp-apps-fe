import React, { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useGetCoaQuery, useGetConfigTransactionTypesQuery, useUpdateConfigTransactionTypeMutation } from "@/store/slices/coaApi";
import { Loader2, Settings2, Save, ArrowRightLeft, Landmark, Banknote } from "lucide-react";
import * as toast from "@/utils/toast";

const TransactionConfigPage: React.FC = () => {
  const { data: coaData, isLoading: isLoadingCOA } = useGetCoaQuery();
  const { data: typesData, isLoading: isLoadingTypes } = useGetConfigTransactionTypesQuery();
  const [updateType, { isLoading: isUpdating }] = useUpdateConfigTransactionTypeMutation();

  const coaList = coaData || [];
  const typesList = typesData?.data || [];

  const handleUpdateMapping = async (id: number, field: "default_debit_coa" | "default_credit_coa", value: string) => {
    try {
      await updateType({ id, data: { [field]: value } }).unwrap();
      toast.showSuccess("Pemetaan COA berhasil diperbarui.");
    } catch (error) {
      toast.showError("Gagal memperbarui pemetaan.");
    }
  };

  return (
    <DashboardLayout title="Konfigurasi Transaksi" role="administrasi">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Konfigurasi Pemetaan COA</h1>
          <p className="text-muted-foreground">Tentukan akun Debit dan Kredit otomatis untuk setiap jenis transaksi perbankan.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
             <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings2 className="h-6 w-6 text-primary" />
             </div>
             <div>
                <CardTitle>Pemetaan Jurnal Otomatis</CardTitle>
                <CardDescription>Sistem akan menggunakan akun ini untuk mencatat Double-Entry di Buku Besar.</CardDescription>
             </div>
          </CardHeader>
          <CardContent>
            {(isLoadingCOA || isLoadingTypes) ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[200px]">Jenis Transaksi</TableHead>
                      <TableHead>Debit Account (Assets/Exps)</TableHead>
                      <TableHead>Credit Account (Liabs/Revs)</TableHead>
                      <TableHead className="w-[100px] text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {typesList.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell>
                          <div className="font-bold flex items-center gap-2">
                             {type.category === 'topup' ? <Banknote className="h-3 w-3 text-emerald-500" /> : <ArrowRightLeft className="h-3 w-3 text-blue-500" />}
                             {type.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">{type.code}</div>
                        </TableCell>
                        <TableCell>
                          <Select 
                            defaultValue={type.default_debit_coa} 
                            onValueChange={(val) => handleUpdateMapping(type.id, 'default_debit_coa', val)}
                          >
                            <SelectTrigger className="text-xs h-9">
                              <SelectValue placeholder="Pilih akun Debit" />
                            </SelectTrigger>
                            <SelectContent>
                              {coaList.map(coa => (
                                <SelectItem key={coa.coa_code} value={coa.coa_code} className="text-xs">
                                  {coa.coa_code} - {coa.account_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select 
                            defaultValue={type.default_credit_coa} 
                            onValueChange={(val) => handleUpdateMapping(type.id, 'default_credit_coa', val)}
                          >
                            <SelectTrigger className="text-xs h-9">
                              <SelectValue placeholder="Pilih akun Kredit" />
                            </SelectTrigger>
                            <SelectContent>
                              {coaList.map(coa => (
                                <SelectItem key={coa.coa_code} value={coa.coa_code} className="text-xs">
                                  {coa.coa_code} - {coa.account_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-center">
                           <div className="h-2 w-2 rounded-full bg-emerald-500 mx-auto" title="Active" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg flex items-start gap-4">
           <Landmark className="h-5 w-5 text-orange-600 shrink-0 mt-1" />
           <p className="text-sm text-orange-800 dark:text-orange-200">
              <strong>Penting:</strong> Perubahan pemetaan COA hanya akan berdampak pada transaksi yang dilakukan <em>setelah</em> perubahan disimpan. Transaksi historis akan tetap menggunakan jurnal lama.
           </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TransactionConfigPage;
