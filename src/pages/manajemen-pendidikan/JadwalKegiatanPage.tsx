import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import JadwalKegiatanForm from './JadwalKegiatanForm';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { toast } from '@/utils/toast';
import EventCalendar from '../../components/EventCalendar';
import KegiatanList from '../../components/KegiatanList';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export interface Kegiatan {
  id: number;
  date: Date;
  title: string;
  description?: string;
  status: 'Selesai' | 'Belum Selesai';
}

const JadwalKegiatanPage: React.FC = () => {
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([
    { id: 1, date: new Date(), title: 'Rapat Awal Tahun Ajaran', description: 'Membahas rencana semester ganjil.', status: 'Belum Selesai' },
    { id: 2, date: new Date(new Date().setDate(new Date().getDate() + 5)), title: 'Lomba Cerdas Cermat', description: 'Antar kelas jenjang SMP.', status: 'Belum Selesai' },
    { id: 3, date: new Date(new Date().setDate(new Date().getDate() - 10)), title: 'Kerja Bakti', description: 'Membersihkan lingkungan pesantren.', status: 'Selesai' },
  ]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKegiatan, setEditingKegiatan] = useState<Kegiatan | undefined>(undefined);

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Jadwal Kegiatan', icon: <CalendarIcon className="h-4 w-4" /> },
  ];

  const handleSaveKegiatan = (kegiatan: Omit<Kegiatan, 'id' | 'status'>) => {
    const newKegiatan: Kegiatan = {
      ...kegiatan,
      id: Date.now(),
      status: 'Belum Selesai',
    };
    setKegiatanList([...kegiatanList, newKegiatan]);
    toast.success(`Kegiatan "${newKegiatan.title}" berhasil ditambahkan.`);
    setIsDialogOpen(false);
    setEditingKegiatan(undefined);
  };

  const handleDateClick = (date: Date) => {
    setEditingKegiatan(undefined);
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const handleToggleStatus = (id: number) => {
    setKegiatanList(kegiatanList.map(k => 
      k.id === id 
        ? { ...k, status: k.status === 'Selesai' ? 'Belum Selesai' : 'Selesai' }
        : k
    ));
    toast.info('Status kegiatan telah diperbarui.');
  };

  const handleDeleteKegiatan = (id: number) => {
    const kegiatan = kegiatanList.find(k => k.id === id);
    setKegiatanList(kegiatanList.filter(k => k.id !== id));
    if (kegiatan) {
      toast.success(`Kegiatan "${kegiatan.title}" telah dihapus.`);
    }
  };

  return (
    <DashboardLayout title="Jadwal Kegiatan" role="administrasi">
      <div className="container mx-auto pb-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Kalender Kegiatan</CardTitle>
                <CardDescription>Lihat dan kelola jadwal kegiatan pesantren.</CardDescription>
              </div>
              <Button onClick={() => handleDateClick(new Date())}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Kegiatan
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <EventCalendar kegiatanList={kegiatanList} onDateClick={handleDateClick} />
              </div>
              <div className="lg:col-span-1">
                <KegiatanList 
                  kegiatanList={kegiatanList} 
                  onToggleStatus={handleToggleStatus} 
                  onDelete={handleDeleteKegiatan} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingKegiatan ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}</DialogTitle>
            <DialogDescription>
              Isi detail kegiatan di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <JadwalKegiatanForm
            selectedDate={selectedDate}
            initialData={editingKegiatan}
            onSuccess={handleSaveKegiatan}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default JadwalKegiatanPage;