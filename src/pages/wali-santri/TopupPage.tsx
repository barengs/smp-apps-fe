
import React from 'react';
import WaliSantriLayout from '@/layouts/WaliSantriLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, PlusCircle, History, ArrowUpRight, ArrowDownLeft, User } from 'lucide-react';
import { useGetSantriByParentNikQuery } from '@/store/slices/authApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { Skeleton } from '@/components/ui/skeleton';

const TopupPage: React.FC = () => {
    const user = useSelector(selectCurrentUser);
    const nik = user?.profile?.nik;
    const { data: santriData, isLoading } = useGetSantriByParentNikQuery(nik as string, {
        skip: !nik,
    });

    // MOCK DATA: Since backend API doesn't support fetching balance by student ID yet.
    // In production, this should be fetched from an endpoint like /accounts?student_id=...
    const mockBalances: Record<string, number> = {
        '12345': 150000,
        '67890': 75000,
        '11223': 0,
    };

    const students = santriData?.data?.student || [];

    // Calculate Grand Total
    const totalBalance = students.reduce((acc, student) => {
        return acc + (mockBalances[student.nis] || 0); // Using NIS as key for mock
    }, 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <WaliSantriLayout title="Topup & Tabungan" role="wali-santri">
            <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
                
                {/* Header Information */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 md:p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400 opacity-10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                    
                    <div className="relative z-10">
                        <h2 className="text-xl md:text-2xl font-medium opacity-90 mb-1">Total Saldo Tabungan</h2>
                        <div className="text-4xl md:text-5xl font-bold mb-6">
                            {isLoading ? (
                                <Skeleton className="h-12 w-64 bg-white/20" />
                            ) : (
                                formatCurrency(totalBalance)
                            )}
                        </div>
                        <p className="max-w-xl text-blue-100 text-sm md:text-base leading-relaxed">
                            Saldo ini merupakan tabungan santri yang digunakan untuk keperluan sehari-hari di pesantren, 
                            seperti pembayaran makan, laundry, dan kebutuhan koperasi.
                        </p>
                        <div className="mt-8 flex gap-3">
                             <Button className="bg-white text-blue-600 hover:bg-blue-50 border-0 font-semibold shadow-md">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Topup Saldo
                            </Button>
                            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                                <History className="mr-2 h-4 w-4" />
                                Riwayat Transaksi
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Individual Student Balances */}
                <div>
                     <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-gray-500" />
                        Rincian Saldo Santri
                    </h3>
                    
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2].map((i) => (
                                <Skeleton key={i} className="h-40 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {students.map((student) => {
                                const balance = mockBalances[student.nis] || 0;
                                const photoUrl = student.photo 
                                    ? (student.photo.startsWith('http') ? student.photo : `${import.meta.env.VITE_API_URL || ''}/storage/${student.photo}`) 
                                    : null;

                                return (
                                    <Card key={student.id} className="hover:shadow-md transition-shadow border-slate-200">
                                        <CardHeader className="pb-3 flex flex-row items-center gap-4">
                                             <div className="h-12 w-12 rounded-full overflow-hidden border bg-gray-100 flex-shrink-0">
                                                {photoUrl ? (
                                                    <img src={photoUrl} alt={student.first_name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                        <User className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <CardTitle className="text-base font-bold line-clamp-1">
                                                    {student.first_name} {student.last_name || ''}
                                                </CardTitle>
                                                <CardDescription className="text-xs">
                                                    NIS: {student.nis}
                                                </CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="pt-2">
                                                <p className="text-sm text-muted-foreground mb-1">Sisa Saldo</p>
                                                <div className="flex justify-between items-end">
                                                    <span className="text-2xl font-bold text-gray-900">{formatCurrency(balance)}</span>
                                                    <Button size="sm" variant="secondary" className="h-8 text-xs">
                                                        Topup
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent Transactions Mockup */}
                 <div>
                     <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <History className="h-5 w-5 text-gray-500" />
                        Transaksi Terakhir
                    </h3>
                    <Card>
                        <CardContent className="p-0">
                            {[1, 2, 3].map((item, index) => (
                                <div key={index} className={`flex items-center justify-between p-4 ${index !== 2 ? 'border-b' : ''} hover:bg-slate-50 transition-colors`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${index === 1 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {index === 1 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">
                                                {index === 1 ? 'Pembayaran Laundry' : 'Topup Saldo via Transfer'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                12 Feb 2024 • 14:30 WIB • {index === 1 ? 'Ahmad Dahlan' : 'Siti Aminah'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`font-bold text-sm ${index === 1 ? 'text-red-600' : 'text-green-600'}`}>
                                        {index === 1 ? '-' : '+'}{formatCurrency(index === 1 ? 25000 : 500000)}
                                    </span>
                                </div>
                            ))}
                            <div className="p-3 text-center border-t bg-slate-50 rounded-b-xl">
                                <Button variant="link" className="text-sm h-auto py-0">Lihat Semua Transaksi</Button>
                            </div>
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </WaliSantriLayout>
    );
};

export default TopupPage;
