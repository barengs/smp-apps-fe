import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

// Dummy data for Santri selection (replace with API call later)
const dummySantriList = [
  { id: '1', name: 'Ahmad Fulan (NIS: 12345)' },
  { id: '2', name: 'Siti Aminah (NIS: 67890)' },
  { id: '3', name: 'Budi Santoso (NIS: 11223)' },
  { id: '4', name: 'Dewi Lestari (NIS: 44556)' },
];

const formSchema = z.object({
  santriId: z.string().min(1, { message: 'Santri wajib dipilih.' }),
  wilayahTugas: z.string().min(1, { message: 'Wilayah Tugas wajib diisi.' }),
  penanggungJawab: z.string().min(1, { message: 'Penanggung Jawab wajib diisi.' }),
  nomorKontakPJ: z.string().min(10, { message: 'Nomor Kontak PJ minimal 10 digit.' }),
  institusiMagang: z.string().min(1, { message: 'Institusi Magang wajib diisi.' }),
  alamatInstitusi: z.string().min(1, { message: 'Alamat Institusi wajib diisi.' }),
});

interface GuruTugasFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const GuruTugasForm: React.FC<GuruTugasFormProps> = ({ onSuccess, onCancel }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      santriId: '',
      wilayahTugas: '',
      penanggungJawab: '',
      nomorKontakPJ: '',
      institusiMagang: '',
      alamatInstitusi: '',
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false); // Simulate loading

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.showSuccess('Formulir penugasan berhasil disimpan (simulasi).');
    console.log('Form Data Submitted:', values);
    setIsSubmitting(false);
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="santriId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Santri</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih santri..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {dummySantriList.map((santri) => (
                    <SelectItem key={santri.id} value={santri.id}>
                      {santri.name}
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
          name="wilayahTugas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wilayah Tugas</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Jakarta Pusat" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="penanggungJawab"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Penanggung Jawab</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Bapak Budi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nomorKontakPJ"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor Kontak PJ</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Contoh: 081234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="institusiMagang"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Institusi Magang</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: PT. Maju Bersama" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="alamatInstitusi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat Institusi</FormLabel>
              <FormControl>
                <Textarea placeholder="Alamat lengkap institusi magang..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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