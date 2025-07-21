import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import JadwalKegiatanForm from './JadwalKegiatanForm';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { toast } from 'sonner';
import EventCalendar from '../../components/EventCalendar';

export interface Kegiatan {
  id: number;
  date: Date;
  title: string;
  description?: string;
}

const JadwalKegiatanPage: React.FC = () => {
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([
    { id: 1, date: new Date(), title: 'Rapat Awal Tahun Ajaran', description: 'Membahas rencana semester ganjil.' },
    { id: 2, date: new Date(new Date().setDate(new Date().getDate() + 5)), title: 'Lomba Cerdas Cermat', description: 'Antar kelas jenjang SMP.' },
  ]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKegiatan, setEditingKegiatan] = useState<Kegiatan | undefined>(undefined);

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Jadwal Kegiatan', icon: <CalendarIcon className="h-4 w-4" /> },
  ];

  const handleSaveKegiatan = (kegiatan: Omit<Kegiatan, 'id'>) => {
    // This function will handle both add and edit in the future
    const newKegiatan = { ...kegiatan, id: Date.now() };
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
            <EventCalendar kegiatanList={kegiatanList} onDateClick={handleDateClick} />
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