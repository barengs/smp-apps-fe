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
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { dummyHakAksesData } from './HakAksesTable'; // Import dummy data for access rights

const formSchema = z.object({
  roleName: z.string().min(2, {
    message: 'Nama Peran harus minimal 2 karakter.',
  }),
  description: z.string().optional(),
  // usersCount: z.number().min(0, { // Removed this field
  //   message: 'Jumlah Pengguna tidak boleh negatif.',
  // }).default(0),
  accessRights: z.array(z.string()).optional(),
});

interface PeranFormProps {
  initialData?: {
    id: string;
    roleName: string;
    description: string;
    // usersCount: number; // Removed this field
    accessRights?: string[];
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const PeranForm: React.FC<PeranFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      // usersCount: initialData.usersCount, // Removed this line
      accessRights: initialData.accessRights || [],
    } : {
      roleName: '',
      description: '',
      // usersCount: 0, // Removed this line
      accessRights: [],
    },
  });

  const availableAccessRights = dummyHakAksesData.map(ha => ({
    value: ha.permission,
    label: ha.permission,
  }));

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (initialData) {
      toast.success(`Peran "${values.roleName}" berhasil diperbarui.`);
    } else {
      toast.success(`Peran "${values.roleName}" berhasil ditambahkan.`);
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
            <FormItem>
              <FormLabel>Nama Peran</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Guru" {...field} />
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
                <Textarea placeholder="Deskripsi singkat peran ini..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Removed the usersCount FormField */}
        <FormField
          control={form.control}
          name="accessRights"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Hak Akses</FormLabel>
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
                        : "Pilih hak akses..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Cari hak akses..." />
                    <CommandEmpty>Tidak ada hak akses ditemukan.</CommandEmpty>
                    <CommandGroup>
                      {availableAccessRights.map((option) => (
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
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit">
            {initialData ? 'Simpan Perubahan' : 'Tambah Peran'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PeranForm;