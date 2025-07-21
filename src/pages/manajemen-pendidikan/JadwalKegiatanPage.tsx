import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import JadwalKegiatanForm from './JadwalKegiatanForm';
import CustomBreadcrumb, { BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { toast } from 'sonner';

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

  const handleAddKegiatan = (kegiatan: Omit<Kegiatan, 'id'>) => {
    const newKegiatan = { ...kegiatan, id: Date.now() };
    setKegiatanList([...kegiatanList, newKegiatan]);
    toast.success(`Kegiatan "${newKegiatan.title}" berhasil ditambahkan.`);
    setIsDialogOpen(false);
  };

  const handleOpenDialog = (date?: Date) => {
    setEditingKegiatan(undefined);
    setSelectedDate(date || new Date());
    setIsDialogOpen(true);
  };

  const kegiatanPadaTanggalTerpilih = useMemo(() => {
    if (!selectedDate) return [];
    return kegiatanList.filter(
      (k) => format(k.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    );
  }, [selectedDate, kegiatanList]);

  const eventDates = useMemo(() => kegiatanList.map(k => k.date), [kegiatanList]);

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
              <Button onClick={() => handleOpenDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Kegiatan
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                locale={id}
                modifiers={{ event: eventDates }}
                modifiersStyles={{
                  event: {
                    border: '2px solid currentColor',
                    borderRadius: '50%',
                    borderColor: 'hsl(var(--primary))',
                  },
                }}
              />
            </div>
            <div className="md:col-span-1">
              <h3 className="text-lg font-semibold mb-4">
                Kegiatan pada {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: id }) : '...'}
              </h3>
              <div className="space-y-4">
                {kegiatanPadaTanggalTerpilih.length > 0 ? (
                  kegiatanPadaTanggalTerpilih.map((kegiatan) => (
                    <div key={kegiatan.id} className="p-3 bg-muted rounded-lg">
                      <p className="font-bold">{kegiatan.title}</p>
                      <p className="text-sm text-muted-foreground">{kegiatan.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Tidak ada kegiatan pada tanggal ini.</p>
                )}
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
            onSuccess={handleAddKegiatan}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default JadwalKegiatanPage;