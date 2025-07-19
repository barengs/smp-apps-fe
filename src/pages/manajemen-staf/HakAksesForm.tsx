import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { dummyPeranData } from './PeranTable'; // Import dummy data for available roles
import { Textarea } from '@/components/ui/textarea'; // Ditambahkan impor Textarea di sini

const formSchema = z.object({
  roleName: z.array(z.string()).min(1, { // Changed to array of strings
    message: 'Pilih minimal satu Nama Peran.',
  }),
  permission: z.string().min(2, {
    message: 'Hak Akses harus minimal 2 karakter.',
  }),
  description: z.string().optional(),
});

interface HakAksesFormProps {
  initialData?: {
    id: string;
    roleName: string[]; // Changed to array of strings
    permission: string;
    description: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const HakAksesForm: React.FC<HakAksesFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      roleName: initialData.roleName || [], // Ensure it's an array
    } : {
      roleName: [],
      permission: '',
      description: '',
    },
  });

  const availableRoleNames = dummyPeranData.map(peran => ({
    value: peran.roleName,
    label: peran.roleName,
  }));

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (initialData) {
      toast.success(`Hak Akses untuk "${values.roleName.join(', ')}" berhasil diperbarui.`);
    } else {
      toast.success(`Hak Akses untuk "${values.roleName.join(', ')}" berhasil ditambahkan.`);
    }
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="roleName"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Nama Peran</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value?.length && "text-muted-foreground"
                      )}
                    >
                      {field.value && field.value.length > 0
                        ? (
                            <div className="flex flex-wrap gap-1">
                              {field.value.map((item) => (
                                <Badge key={item} variant="secondary">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          )
                        : "Pilih nama peran..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Cari nama peran..." />
                    <CommandEmpty>Tidak ada nama peran ditemukan.</CommandEmpty>
                    <CommandGroup>
                      {availableRoleNames.map((option) => (
                        <CommandItem
                          key={option.value}
                          onSelect={() => {
                            const currentValues = new Set(field.value);
                            if (currentValues.has(option.value)) {
                              currentValues.delete(option.value);
                            } else {
                              currentValues.add(option.value);
                            }
                            field.onChange(Array.from(currentValues));
                          }}
                        >
                          <Checkbox
                            checked={field.value?.includes(option.value)}
                            onCheckedChange={(checked) => {
                              const currentValues = new Set(field.value);
                              if (checked) {
                                currentValues.add(option.value);
                              } else {
                                currentValues.delete(option.value);
                              }
                              field.onChange(Array.from(currentValues));
                            }}
                            className="mr-2"
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="permission"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hak Akses</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Full Access" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea placeholder="Deskripsi singkat hak akses ini..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit">
            {initialData ? 'Simpan Perubahan' : 'Tambah Hak Akses'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default HakAksesForm;