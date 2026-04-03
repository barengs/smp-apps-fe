import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    QrCode, 
    User, 
    CheckCircle2, 
    XCircle, 
    LogOut, 
    LogIn, 
    ArrowRight,
    AlertCircle,
    Info
} from 'lucide-react';
import { useCheckoutByNisMutation, useCheckinByNisMutation } from '@/store/slices/holidayApi';
import { showError, showSuccess } from '@/utils/toast';
import { format } from 'date-fns';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';

const HolidayVerificationPage: React.FC = () => {
    const [nis, setNis] = useState('');
    const [mode, setMode] = useState<'checkout' | 'checkin'>('checkout');
    const [lastScan, setLastScan] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [checkout, { isLoading: isCheckoutLoading }] = useCheckoutByNisMutation();
    const [checkin, { isLoading: isCheckinLoading }] = useCheckinByNisMutation();

    const isLoading = isCheckoutLoading || isCheckinLoading;

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [mode]);

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nis.trim() || isLoading) return;

        setError(null);
        try {
            let result;
            if (mode === 'checkout') {
                result = await checkout({ nis }).unwrap();
            } else {
                result = await checkin({ nis }).unwrap();
            }

            setLastScan(result.data);
            showSuccess(result.message);
            setNis('');
            
            // Re-focus after short delay to ensure UI updates don't steal focus
            setTimeout(() => inputRef.current?.focus(), 100);
        } catch (err: any) {
            setError(err.data?.message || 'Terjadi kesalahan saat verifikasi');
            setLastScan(err.data || null);
            setNis('');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const breadcrumbItems = [
        { label: 'Manajemen Kamtib', href: '#' },
        { label: 'Verifikasi Libur', icon: <QrCode className="h-4 w-4" /> }
    ];

    return (
        <DashboardLayout title="Verifikasi Libur Santri" role="administrasi">
            <div className="container mx-auto p-4 space-y-6 max-w-4xl">
                <CustomBreadcrumb items={breadcrumbItems} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Panel: Scanning Area */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="border-2 border-primary/20 shadow-lg">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <QrCode className="h-5 w-5 text-primary" />
                                    Scan Card / NIS
                                </CardTitle>
                                <CardDescription>Gunakan QR Scanner atau ketik NIS secara manual.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleScan} className="space-y-4">
                                    <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="checkout" className="flex items-center gap-2">
                                                <LogOut className="h-4 w-4" /> Checkout
                                            </TabsTrigger>
                                            <TabsTrigger value="checkin" className="flex items-center gap-2">
                                                <LogIn className="h-4 w-4" /> Checkin
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>

                                    <div className="relative">
                                        <Input
                                            ref={inputRef}
                                            value={nis}
                                            onChange={(e) => setNis(e.target.value)}
                                            placeholder="Input NIS..."
                                            className="text-lg h-14 pl-4 pr-12 focus:ring-2 focus:ring-primary font-mono tracking-widest"
                                            autoComplete="off"
                                            disabled={isLoading}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>}
                                            {!isLoading && <ArrowRight className="h-5 w-5 text-muted-foreground" />}
                                        </div>
                                    </div>

                                    <Button 
                                        type="submit" 
                                        className="w-full h-12 text-lg font-semibold"
                                        disabled={!nis || isLoading}
                                    >
                                        Verifikasi
                                    </Button>
                                </form>

                                <div className="mt-6 p-3 bg-muted rounded-lg text-xs text-muted-foreground flex items-start gap-2">
                                    <Info className="h-4 w-4 mt-0.5 shrink-0" />
                                    <p>Pastikan kursor tetap berada di kotak input agar scanner dapat otomatis melakukan pencarian.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Panel: Result Display */}
                    <div className="md:col-span-2">
                        {error ? (
                            <Card className="border-destructive/50 bg-destructive/5 h-full min-h-[400px] flex flex-col items-center justify-center text-center p-6 space-y-4">
                                <div className="bg-destructive/10 p-4 rounded-full">
                                    <XCircle className="h-16 w-16 text-destructive" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-destructive">Verifikasi Gagal</h3>
                                    <p className="text-lg text-destructive/80 max-w-md">{error}</p>
                                </div>
                                
                                {lastScan?.student && (
                                    <div className="bg-background/80 p-4 rounded-xl border border-destructive/20 w-full max-w-md mt-4">
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                <User className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-lg">{lastScan.student.first_name} {lastScan.student.last_name}</div>
                                                <div className="text-muted-foreground">NIS: {lastScan.student.nis}</div>
                                            </div>
                                        </div>
                                        {lastScan.total_requirements > 0 && (
                                            <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm font-medium">
                                                <span className="text-muted-foreground">Persyaratan Terpenuhi:</span>
                                                <Badge variant="destructive">{lastScan.requirements_met} / {lastScan.total_requirements}</Badge>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <Button variant="outline" size="sm" onClick={() => setError(null)} className="mt-4">Bersihkan Lapisan</Button>
                            </Card>
                        ) : lastScan ? (
                            <Card className="border-success/50 bg-success/5 h-full min-h-[400px] flex flex-col p-6 overflow-hidden">
                                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                                    <div className="bg-success/10 p-4 rounded-full animate-bounce">
                                        <CheckCircle2 className="h-16 w-16 text-success" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-3xl font-bold text-success">Verifikasi Berhasil</h3>
                                        <p className="text-muted-foreground">{mode === 'checkout' ? 'Santri diperbolehkan pulang' : 'Kedatangan santri telah dicatat'}</p>
                                    </div>

                                    <div className="bg-background shadow-xl p-6 rounded-2xl border border-success/20 w-full max-w-md mt-6 relative overflow-hidden">
                                        {/* Decorative Background */}
                                        <div className="absolute top-0 right-0 p-2 opacity-5">
                                            <User className="h-24 w-24" />
                                        </div>

                                        <div className="flex flex-col items-center gap-4 text-center">
                                            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center border-4 border-background ring-2 ring-primary/20 overflow-hidden">
                                                {lastScan.student.photo ? (
                                                    <img src={lastScan.student.photo} alt="Profile" className="h-full w-full object-cover" />
                                                ) : (
                                                    <User className="h-12 w-12 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-2xl font-black tracking-tight">{lastScan.student.first_name} {lastScan.student.last_name}</div>
                                                <div className="text-primary font-mono font-bold text-lg">{lastScan.student.nis}</div>
                                                <div className="flex items-center justify-center gap-2 mt-2">
                                                    <Badge variant="outline" className="bg-primary/5">{lastScan.student.room?.name || 'Belum ada Kamar'}</Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-muted/30 rounded-xl space-y-1">
                                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Status Sekarang</div>
                                                <div className="flex items-center gap-1 font-semibold text-sm">
                                                    {mode === 'checkout' ? <LogOut className="h-3 w-3 text-red-500" /> : <LogIn className="h-3 w-3 text-green-500" />}
                                                    {mode === 'checkout' ? 'Check-Out' : 'Check-In'}
                                                </div>
                                            </div>
                                            <div className="p-3 bg-muted/30 rounded-xl space-y-1">
                                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Waktu</div>
                                                <div className="font-semibold text-sm">
                                                    {format(new Date(), 'HH:mm:ss')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-center">
                                    <Button variant="ghost" onClick={() => setLastScan(null)} className="text-muted-foreground">Siap untuk selanjutnya...</Button>
                                </div>
                            </Card>
                        ) : (
                            <Card className="h-full min-h-[400px] border-dashed flex flex-col items-center justify-center text-center p-6 text-muted-foreground bg-muted/10">
                                <div className="p-6 bg-muted rounded-full mb-4">
                                    <QrCode className="h-12 w-12 opacity-20" />
                                </div>
                                <h3 className="text-xl font-medium">Menunggu Scan</h3>
                                <p className="max-w-xs mt-2 text-sm">Silakan lakukan scan kartu santri atau masukkan NIS untuk memulai verifikasi.</p>
                                
                                <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-sm">
                                    <div className="p-4 border rounded-xl flex items-center gap-3">
                                        <div className="p-2 bg-yellow-500/10 rounded-lg"><LogOut className="h-5 w-5 text-yellow-600" /></div>
                                        <div className="text-left text-xs">
                                            <div className="font-bold">Checkout</div>
                                            <div className="opacity-70">Pulang Liburan</div>
                                        </div>
                                    </div>
                                    <div className="p-4 border rounded-xl flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg"><LogIn className="h-5 w-5 text-blue-600" /></div>
                                        <div className="text-left text-xs">
                                            <div className="font-bold">Checkin</div>
                                            <div className="opacity-70">Kembali Liburan</div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default HolidayVerificationPage;
