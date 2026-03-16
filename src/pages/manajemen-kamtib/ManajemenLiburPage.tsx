import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar, Trash2, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import {
    useGetHolidayPeriodsQuery,
    useCreateHolidayPeriodMutation,
    useUpdateHolidayPeriodMutation,
    useDeleteHolidayPeriodMutation,
    HolidayPeriod
} from '@/store/slices/holidayApi';
import { showSuccess, showError } from '@/utils/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const ManajemenLiburPage: React.FC = () => {
    const { data: periodsResponse, isLoading } = useGetHolidayPeriodsQuery();
    const [createPeriod] = useCreateHolidayPeriodMutation();
    const [updatePeriod] = useUpdateHolidayPeriodMutation();
    const [deletePeriod] = useDeleteHolidayPeriodMutation();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPeriod, setEditingPeriod] = useState<HolidayPeriod | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'active' as 'active' | 'inactive',
        requirements: [] as { name: string; description: string }[]
    });

    const [newRequirement, setNewRequirement] = useState('');

    const handleOpenAdd = () => {
        setEditingPeriod(null);
        setFormData({
            name: '',
            description: '',
            start_date: '',
            end_date: '',
            status: 'active',
            requirements: []
        });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (period: HolidayPeriod) => {
        setEditingPeriod(period);
        setFormData({
            name: period.name,
            description: period.description || '',
            start_date: period.start_date,
            end_date: period.end_date,
            status: period.status,
            requirements: period.requirements.map(r => ({ name: r.name, description: r.description || '' }))
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editingPeriod) {
                await updatePeriod({ id: editingPeriod.id, data: formData }).unwrap();
                showSuccess('Periode libur diperbarui');
            } else {
                await createPeriod(formData).unwrap();
                showSuccess('Periode libur dibuat');
            }
            setIsDialogOpen(false);
        } catch (err: any) {
            showError(err.data?.message || 'Gagal menyimpan data');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Hapus periode libur ini?')) {
            try {
                await deletePeriod(id).unwrap();
                showSuccess('Periode libur dihapus');
            } catch (err) {
                showError('Gagal menghapus data');
            }
        }
    };

    const addRequirement = () => {
        if (newRequirement.trim()) {
            setFormData({
                ...formData,
                requirements: [...formData.requirements, { name: newRequirement.trim(), description: '' }]
            });
            setNewRequirement('');
        }
    };

    const removeRequirement = (index: number) => {
        const newReqs = [...formData.requirements];
        newReqs.splice(index, 1);
        setFormData({ ...formData, requirements: newReqs });
    };

    const breadcrumbItems = [
        { label: 'Manajemen Kamtib', href: '#' },
        { label: 'Manajemen Libur', icon: <Calendar className="h-4 w-4" /> }
    ];

    return (
        <DashboardLayout title="Manajemen Libur" role="administrasi">
            <div className="container mx-auto p-4 space-y-4">
                <CustomBreadcrumb items={breadcrumbItems} />

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Daftar Periode Libur</CardTitle>
                            <CardDescription>Kelola jadwal libur santri dan persyaratan yang diperlukan.</CardDescription>
                        </div>
                        <Button onClick={handleOpenAdd} size="sm" variant="success">
                            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Periode
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-4">Memuat data...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted text-muted-foreground font-medium border-b">
                                        <tr>
                                            <th className="px-4 py-3">Nama Libur</th>
                                            <th className="px-4 py-3">Periode</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Syarat</th>
                                            <th className="px-4 py-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {periodsResponse?.data.map((period) => (
                                            <tr key={period.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-4 py-4 font-medium">{period.name}</td>
                                                <td className="px-4 py-4">
                                                    {format(new Date(period.start_date), 'dd MMM')} - {format(new Date(period.end_date), 'dd MMM yyyy')}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {period.status === 'active' ? (
                                                        <Badge variant="success">Aktif</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Non-aktif</Badge>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-muted-foreground">{period.requirements.length} Syarat</span>
                                                </td>
                                                <td className="px-4 py-4 text-right space-x-2">
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link to={`/dashboard/manajemen-kamtib/libur-santri/${period.id}`}>
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-blue-500" /> Verifikasi Santri
                                                        </Link>
                                                    </Button>
                                                    <Button onClick={() => handleOpenEdit(period)} variant="ghost" size="sm">
                                                        <Edit2 className="h-4 w-4 text-yellow-600" />
                                                    </Button>
                                                    <Button onClick={() => handleDelete(period.id)} variant="ghost" size="sm">
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {periodsResponse?.data.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Belum ada periode libur.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingPeriod ? 'Edit Periode Libur' : 'Tambah Periode Libur'}</DialogTitle>
                        <DialogDescription>Masukkan detail periode libur dan tentukan persyaratan wajib.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama Libur</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Contoh: Libur Ramadhan"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                >
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Non-aktif</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="start_date">Tanggal Pulang</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end_date">Tanggal Kembali</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Keterangan tambahan..."
                            />
                        </div>
                        <hr />
                        <div className="space-y-2">
                            <Label>Persyaratan Wajib</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Nama syarat (misal: Lunas SPP)"
                                    value={newRequirement}
                                    onChange={(e) => setNewRequirement(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                                />
                                <Button onClick={addRequirement} type="button">Tambah</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.requirements.map((req, idx) => (
                                    <Badge key={idx} variant="outline" className="pl-3 pr-1 py-1 flex items-center gap-1">
                                        {req.name}
                                        <Button
                                            onClick={() => removeRequirement(idx)}
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto p-0 hover:bg-transparent"
                                        >
                                            <XCircle className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsDialogOpen(false)} variant="ghost">Batal</Button>
                        <Button onClick={handleSave} variant="success">Simpan Perubahan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default ManajemenLiburPage;
