import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as toast from '@/utils/toast';
import { Loader2 } from 'lucide-react';
import CityCombobox from '@/components/CityCombobox';
import { useGetSantriQuery } from '@/store/slices/santriApi';
import { useGetTahunAjaranQuery } from '@/store/slices/tahunAjaranApi';
import { useGetPartnersQuery } from '@/store/slices/partnerApi';
import { useGetEmployeesQuery } from '@/store/slices/employeeApi';
import { useCreateInternshipMutation } from '@/store/slices/internshipApi';
import { DatePicker } from '@/components/ui/datepicker';
import { format } from 'date-fns';

const formSchema = z.object({
  student_id: z.string().min(1, { message: 'Santri wajib dipilih.' }),
  academic_year_id: z.string().min(1, { message: 'Tahun Ajaran wajib dipilih.' }),
  city_id: z.string().min(1, { message: 'Wilayah Tugas wajib dipilih.' }),
  supervisor_id: z.string().min(1, { message: 'Penanggung Jawab wajib dipilih.' }),
  partner_id: z.string().min(1, { message: 'Institusi Magang wajib dipilih.' }),
  start_date: z.date({ required_error: 'Tanggal mulai wajib diisi.' }),
  end_date: z.date({ required_error: 'Tanggal selesai wajib diisi.' }),
}).refine(data => data.end_date > data.start_date, {
  message: "Tanggal selesai harus setelah tanggal mulai.",
  path: ["end_date"],
});

interface GuruTugasFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const GuruTugasForm: React.FC<GuruTugasFormProps> = ({ onSuccess, onCancel }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // --- RTK Query Hooks ---
  const { data: santriResponse, isLoading: isLoadingSantri } = useGetSantriQuery();
  const { data: tahunAjaranResponse, isLoading: isLoadingTahunAjaran } = useGetTahunAjaranQuery();
  const { data: partnerResponse, isLoading: isLoadingPartner } = useGetPartnersQuery();
  const { data: employeeResponse, isLoading: isLoadingEmployee } = useGetEmployeesQuery();
  const [createInternship, { isLoading: isSubmitting }] = useCreateInternshipMutation();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload = {
      ...values,
      start_date: format(values.start_date, 'yyyy-MM-dd'),
      end_date: format(values.end_date, 'yyyy-MM-dd'),
      status: 'assigned', // Default status
    };

    try {
      await createInternship(payload).unwrap();
      toast.showSuccess('Formulir penugasan berhasil disimpan.');
      onSuccess();
    } catch (error) {
      toast.showError('Gagal menyimpan formulir. Silakan coba lagi.');
      console.error('Form Data Submission Error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="student_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Santri</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingSantri}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingSantri ? "Memuat..." : "Pilih santri..."} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {santriResponse?.data.map((santri) => (
                      <SelectItem key={santri.id} value={String(santri.id)}>
                        {santri.nama} (NIS: {santri.nis})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="academic_year_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tahun Ajaran</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingTahunAjaran}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingTahunAjaran ? "Memuat..." : "Pilih tahun ajaran..."} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tahunAjaranResponse?.map((th) => (
                      <SelectItem key={th.id} value={String(th.id)}>
                        {th.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wilayah Tugas</FormLabel>
                <FormControl>
                  <CityCombobox
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="partner_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Institusi Magang</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingPartner}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingPartner ? "Memuat..." : "Pilih institusi..."} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {partnerResponse?.data.map((partner) => (
                      <SelectItem key={partner.id} value={String(partner.id)}>
                        {partner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="supervisor_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Penanggung Jawab (Supervisor)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingEmployee}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingEmployee ? "Memuat..." : "Pilih penanggung jawab..."} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employeeResponse?.data.map((employee) => (
                      <SelectItem key={employee.id} value={String(employee.id)}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div></div> {/* Spacer */}
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Mulai</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
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
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" variant="success" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
              </>
            ) : (
              'Simpan Penugasan'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default GuruTugasForm;