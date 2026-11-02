import React, { useState } from 'react';
import { AcademicYear, AcademicQuarter } from '@/types/pendidikan';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { useGetAcademicQuartersQuery, useCreateAcademicQuarterMutation, useUpdateAcademicQuarterMutation, useDeleteAcademicQuarterMutation, AcademicQuarterRequest } from '@/store/slices/tahunAjaranApi';
import * as toast from '@/utils/toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { DatePickerWithYear } from '@/components/ui/datepicker-with-year';

const quarterSchema = z.object({
  name: z.string().min(1, 'Nama kuartal wajib diisi'),
  start_date: z.date({ required_error: 'Tanggal mulai wajib diisi' }),
  end_date: z.date({ required_error: 'Tanggal selesai wajib diisi' }),
  active: z.boolean().default(false),
}).refine(data => data.end_date >= data.start_date, {
  message: 'Tanggal selesai tidak boleh sebelum tanggal mulai',
  path: ['end_date'],
});

interface AcademicQuarterModalProps {
  isOpen: boolean;
  onClose: () => void;
  academicYear: AcademicYear | null;
}

const AcademicQuarterModal: React.FC<AcademicQuarterModalProps> = ({ isOpen, onClose, academicYear }) => {
  const { data: quartersData, isLoading } = useGetAcademicQuartersQuery(
    { academic_year_id: academicYear?.id },
    { skip: !academicYear }
  );

  const [createQuarter] = useCreateAcademicQuarterMutation();
  const [updateQuarter] = useUpdateAcademicQuarterMutation();
  const [deleteQuarter] = useDeleteAcademicQuarterMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuarter, setEditingQuarter] = useState<AcademicQuarter | null>(null);

  const form = useForm<z.infer<typeof quarterSchema>>({
    resolver: zodResolver(quarterSchema),
    defaultValues: {
      name: '',
      start_date: undefined,
      end_date: undefined,
      active: false,
    },
  });

  const quarters = quartersData?.data || [];

  const handleOpenForm = (quarter?: AcademicQuarter) => {
    if (quarter) {
      setEditingQuarter(quarter);
      form.reset({
        name: quarter.name,
        start_date: new Date(quarter.start_date),
        end_date: new Date(quarter.end_date),
        active: quarter.active,
      });
    } else {
      setEditingQuarter(null);
      form.reset({
        name: '',
        start_date: undefined,
        end_date: undefined,
        active: false,
      });
    }
    setIsFormOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof quarterSchema>) => {
    if (!academicYear) return;

    const payload: AcademicQuarterRequest = {
      academic_year_id: academicYear.id,
      name: values.name,
      start_date: format(values.start_date, 'yyyy-MM-dd'),
      end_date: format(values.end_date, 'yyyy-MM-dd'),
      active: values.active,
    };

    try {
      if (editingQuarter) {
        await updateQuarter({ id: editingQuarter.id, data: payload }).unwrap();
        toast.showSuccess('Kuartal berhasil diperbarui');
      } else {
        await createQuarter(payload).unwrap();
        toast.showSuccess('Kuartal berhasil ditambahkan');
      }
      setIsFormOpen(false);
    } catch (error) {
      toast.showError('Gagal menyimpan kuartal');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus kuartal ini?')) {
      try {
        await deleteQuarter(id).unwrap();
        toast.showSuccess('Kuartal berhasil dihapus');
      } catch (error) {
        toast.showError('Gagal menghapus kuartal');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kelola Kuartal - Tahun Ajaran {academicYear?.year}</DialogTitle>
          <DialogDescription>
            Atur periode kuartal untuk tahun ajaran aktif.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end mb-4">
          <Button onClick={() => handleOpenForm()} size="sm" variant="success">
            <Plus className="h-4 w-4 mr-2" /> Tambah Kuartal
          </Button>
        </div>

        {isLoading ? (
          <div className="py-10 text-center">Memuat data...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Kuartal</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quarters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    Belum ada data kuartal.
                  </TableCell>
                </TableRow>
              ) : (
                quarters.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.name}</TableCell>
                    <TableCell>
                      <div className="text-xs flex flex-col">
                        <span>{format(new Date(q.start_date), 'dd MMM yyyy', { locale: id })}</span>
                        <span className="text-muted-foreground">-</span>
                        <span>{format(new Date(q.end_date), 'dd MMM yyyy', { locale: id })}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={q.active ? 'default' : 'secondary'}>
                        {q.active ? 'Aktif' : 'Non-Aktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenForm(q)}>
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>{editingQuarter ? 'Edit Kuartal' : 'Tambah Kuartal'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Kuartal</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Kuartal 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Mulai</FormLabel>
                        <DatePickerWithYear value={field.value} onValueChange={field.onChange} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Selesai</FormLabel>
                        <DatePickerWithYear value={field.value} onValueChange={field.onChange} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Status Aktif</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" variant="success">
                    {editingQuarter ? 'Simpan Perubahan' : 'Tambah Kuartal'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default AcademicQuarterModal;
