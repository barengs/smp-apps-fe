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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { useCreateStudentMutation, useUpdateStudentMutation, type CreateUpdateStudentRequest } from '@/store/slices/studentApi';
import { useGetProgramsQuery } from '@/store/slices/programApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

const formSchema = z.object({
  first_name: z.string().min(2, {
    message: 'Nama depan harus minimal 2 karakter.',
  }),
  last_name: z.string().nullable().optional(),
  nis: z.string().min(1, {
    message: 'NIS tidak boleh kosong.',
  }),
  nik: z.string().nullable().optional(),
  period: z.string().min(1, {
    message: 'Periode tidak boleh kosong.',
  }),
  gender: z.enum(['L', 'P'], {
    required_error: 'Jenis kelamin harus dipilih.',
  }),
  status: z.string().min(1, {
    message: 'Status tidak boleh kosong.',
  }),
  program_id: z.number({
    required_error: 'Program harus dipilih.',
  }),
  born_in: z.string().nullable().optional(),
  born_at: z.date().nullable().optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  photo: z.string().url({ message: 'URL foto tidak valid.' }).nullable().optional(),
});

interface SantriFormProps {
  initialData?: {
    id: number;
    first_name: string;
    last_name: string | null;
    nis: string;
    nik: string | null;
    period: string;
    gender: 'L' | 'P';
    status: string;
    program: { id: number; name: string }; // Nested program object
    born_in?: string | null; // Updated to allow undefined
    born_at?: string | null; // Updated to allow undefined
    address?: string | null; // Updated to allow undefined
    phone?: string | null; // Updated to allow undefined
    photo?: string | null; // Updated to allow undefined
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const SantriForm: React.FC<SantriFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation();
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
  const { data: programsData, isLoading: isLoadingPrograms } = useGetProgramsQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      first_name: initialData.first_name,
      last_name: initialData.last_name,
      nis: initialData.nis,
      nik: initialData.nik,
      period: initialData.period,
      gender: initialData.gender,
      status: initialData.status,
      program_id: initialData.program.id,
      born_in: initialData.born_in,
      born_at: initialData.born_at ? new Date(initialData.born_at) : null,
      address: initialData.address,
      phone: initialData.phone,
      photo: initialData.photo,
    } : {
      first_name: '',
      last_name: null,
      nis: '',
      nik: null,
      period: '',
      gender: 'L', // Default to Male
      status: 'Aktif', // Default status
      program_id: undefined,
      born_in: null,
      born_at: null,
      address: null,
      phone: null,
      photo: null,
    },
  });

  const availablePrograms = programsData || [];
  const studentStatuses = ['Aktif', 'Non-Aktif', 'Lulus', 'Cuti'];

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload: CreateUpdateStudentRequest = {
      ...values,
      born_at: values.born_at ? format(values.born_at, 'yyyy-MM-dd') : null,
    } as CreateUpdateStudentRequest; // Added type assertion here

    try {
      if (initialData) {
        await updateStudent({ id: initialData.id, data: payload }).unwrap();
        toast.success(`Data santri "${values.first_name} ${values.last_name || ''}" berhasil diperbarui.`);
      } else {
        await createStudent(payload).unwrap();
        toast.success(`Santri "${values.first_name} ${values.last_name || ''}" berhasil ditambahkan.`);
      }
      onSuccess();
    } catch (err: unknown) {
      let errorMessage = 'Terjadi kesalahan tidak dikenal.';

      if (typeof err === 'object' && err !== null) {
        if ('status' in err) {
          const fetchError = err as FetchBaseQueryError;
          if (typeof fetchError.status === 'number') {
            if (fetchError.data && typeof fetchError.data === 'object' && 'message' in fetchError.data) {
              errorMessage = (fetchError.data as { message: string }).message;
            } else {
              errorMessage = `Error ${fetchError.status}: ${JSON.stringify(fetchError.data || {})}`;
            }
          } else if (typeof fetchError.status === 'string' && 'error' in fetchError) {
            errorMessage = fetchError.error;
          } else {
            errorMessage = `Error: ${JSON.stringify(fetchError)}`;
          }
        } else if ('message' in err && typeof (err as SerializedError).message === 'string') {
          errorMessage = (err as SerializedError).message;
        } else {
          errorMessage = `Terjadi kesalahan: ${JSON.stringify(err)}`;
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      toast.error(`Gagal menyimpan data santri: ${errorMessage}`);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Depan</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Ahmad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Belakang (Opsional)</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Fulan" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIS</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: 2023001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nik"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIK (Opsional)</Label>
                <FormControl>
                  <Input placeholder="Contoh: 3273xxxxxxxxxxxxxx" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Kelamin</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="L">Laki-Laki</SelectItem>
                    <SelectItem value="<dyad-problem-report summary="4 problems">
<problem file="src/pages/manajemen-santri/SantriForm.tsx" line="126" column="11" code="2322">Type '{ born_at: string; status?: string; nis?: string; nik?: string; period?: string; gender?: &quot;L&quot; | &quot;P&quot;; first_name?: string; last_name?: string; program_id?: number; born_in?: string; address?: string; phone?: string; photo?: string; }' is not assignable to type 'CreateUpdateStudentRequest'.
  Property 'first_name' is optional in type '{ born_at: string; status?: string; nis?: string; nik?: string; period?: string; gender?: &quot;L&quot; | &quot;P&quot;; first_name?: string; last_name?: string; program_id?: number; born_in?: string; address?: string; phone?: string; photo?: string; }' but required in type 'CreateUpdateStudentRequest'.</problem>
<problem file="src/pages/manajemen-santri/SantriFormPage.tsx" line="85" column="15" code="2322">Type 'StudentDetailData' is not assignable to type '{ id: number; first_name: string; last_name: string; nis: string; nik: string; period: string; gender: &quot;L&quot; | &quot;P&quot;; status: string; program: { id: number; name: string; }; born_in: string; born_at: string; address: string; phone: string; photo: string; }'.
  Property 'born_in' is optional in type 'StudentDetailData' but required in type '{ id: number; first_name: string; last_name: string; nis: string; nik: string; period: string; gender: &quot;L&quot; | &quot;P&quot;; status: string; program: { id: number; name: string; }; born_in: string; born_at: string; address: string; phone: string; photo: string; }'.</problem>
<problem file="src/App.tsx" line="41" column="6" code="2304">Cannot find name 'ThemeProvider'.</problem>
<problem file="src/App.tsx" line="81" column="7" code="2304">Cannot find name 'ThemeProvider'.</problem>
</dyad-problem-report><think>**Addressing TypeScript Errors**

I'm currently focused on resolving the TypeScript errors, starting with the first one in `SantriForm.tsx`. I'm analyzing the type mismatch in the `born_date` property to determine the appropriate type. Then, I'll assess the error's source and apply the most suitable fix, potentially adding a type assertion or refining the existing type declaration. My approach will prioritize maintainability and code clarity.


**Tackling the Type Mismatch**

I've made progress on the first error in `SantriForm.tsx`. My analysis pinpointed that the `values` object from `useForm`, even with `zodResolver`, can have optional properties despite a required `first_name` in `CreateUpdateStudentRequest`. I'm exploring solutions that ensure the payload strictly adheres to the expected type before any type assertions. My focus remains on crafting a fix that is clear and maintains the integrity of the code's type safety.


**Refining Type Enforcement**

I'm now zeroing in on Error 1, specifically the type mismatch in `SantriForm.tsx`. My current plan is to ensure `values` strictly conforms to `CreateUpdateStudentRequest` before any spreading. I'm exploring methods to validate the presence of required fields like `first_name` directly within the `payload` construction, to prevent assigning an object that does not fully comply with the interface, as directly asserting the form values type to the interface might be prone to runtime errors if the validation schema permits the required fields to be omitted in the Zod schema. My goal is a robust solution that catches incomplete data early in the process and maintains strong typing.


**Enhancing Payload Construction**

I'm now focusing on Error 1, specifically addressing the type mismatch in `SantriForm.tsx`. I believe the root cause stems from optional properties in `useForm`'s `values`, even with `zodResolver`, diverging from `CreateUpdateStudentRequest`'s stricter requirements. My plan is to refine the `payload` construction by explicitly validating the presence of required fields like `first_name` before object spreading. I'll utilize techniques to ensure the payload fully complies with the `CreateUpdateStudentRequest` interface from the start. My current approach prioritizes creating a robust solution that improves data integrity and ensures that the final payload is strictly typed.


**Addressing the Root Cause**

I've determined that the `first_name` issue stems from how Zod handles optional fields, making the inferred type too broad. Although the schema and request interface require `first_name`, the spread operator's inference can mark it optional. I'm exploring solutions that ensure `payload` strictly adheres to `CreateUpdateStudentRequest` before any type assertions. My focus remains on establishing a robust, type-safe validation before payload creation.


**Revising Payload Construction**

I've determined that the `first_name` issue stems from how Zod handles optional fields, making the inferred type too broad, even though the schema requires it. My plan is to explicitly pick the required fields from `values` and map them to `payload` to ensure strict type compliance. This will involve directly assigning `values.first_name` and other required fields. My focus is a robust, type-safe validation before payload construction.


**Resolving Payload Strictness**

I'm now zeroing in on Error 1 within `SantriForm.tsx`. My current focus is to refine the payload creation to eliminate the type mismatch. By constructing the payload using explicit property assignments, I aim to ensure strict type compliance with `CreateUpdateStudentRequest` from the get-go. This will involve manually setting each required field, preventing the inference of optional properties. My goal is a robust and type-safe solution that guarantees data integrity.


**Validating Data Integrity**

I'm now focusing on Error 1, particularly within `SantriForm.tsx`. My current task is to refine how the `payload` is constructed to eliminate the type mismatch. I'll meticulously map required fields directly from `values`, ensuring strict alignment with the `CreateUpdateStudentRequest` interface. By avoiding the spread operator for these fields, I'll guarantee data integrity and maintain strict type checking from the outset. My aim is a robust solution that is type-safe.


**Validating Data Consistency**

I'm now focusing on Error 1, specifically inside `SantriForm.tsx`. My strategy is to refine the payload structure to strictly adhere to the `CreateUpdateStudentRequest` type. I'll construct the payload with explicit property assignments, eliminating any type inference that could lead to discrepancies. My approach ensures data integrity and robust type checking from the outset.


**Resolving Strict Typing**

I'm zeroing in on Error 1 within `SantriForm.tsx`. My focus now is on enhancing the payload construction to enforce strict compliance with `CreateUpdateStudentRequest`. By explicitly assigning each field, I can prevent the inference of optional properties that are causing the type mismatch. I'm prioritizing data integrity and type safety through this approach.


**Resolving Type Mismatches**

I'm now focusing on the errors within `SantriForm.tsx`, particularly Error 1. After several iterations, I've determined that explicitly mapping the form values to the `payload` is the most robust approach to guarantee strict type compliance. This avoids inference issues related to optional fields introduced by `useForm` and ensures the final payload meets the criteria of `CreateUpdateStudentRequest`. This refinement prevents any type mismatches during the payload creation process, ensuring type safety.


I've determined the best approach to ensure `payload` strictly adheres to `CreateUpdateStudentRequest`. Explicit mapping is the answer. By individually assigning values to `payload` properties, I can avoid type inference issues. This will effectively resolve the mismatch and provide better data integrity. My focus is on achieving a clear and reliable solution for type-safe payload construction.


I've now updated the `payload` construction in `SantriForm.tsx` to explicitly map the necessary properties from `values`, ensuring that all required fields are present and correctly typed. This approach directly addresses the type mismatch and guarantees data integrity. I'm focusing on ensuring a robust fix that catches potential errors early in the process.

**Crafting the Payload Object**

I've revised the payload construction in `SantriForm.tsx`, ensuring each required field, like `first_name`, is explicitly mapped from `values`. This explicit mapping ensures the payload's type adheres strictly to `CreateUpdateStudentRequest` before any type assertions. By validating data directly through property assignment, I've eliminated potential type mismatch issues. The focus remains on data integrity and creating type-safe code that is resilient.


**Validating Data Mapping**

I'm now fully focused on resolving Error 1 within `SantriForm.tsx`. My latest approach entails mapping required fields from `values` directly into the `payload` object. I aim to ensure strict type compliance with `CreateUpdateStudentRequest` from the get-go, addressing the type mismatch efficiently. My primary aim is a robust and type-safe solution.


</think>Tentu, saya akan memperbaiki keempat kesalahan kompilasi TypeScript tersebut.

1.  **`src/pages/manajemen-santri/SantriForm.tsx`**: Kesalahan ini terjadi karena TypeScript tidak sepenuhnya yakin bahwa objek `payload` yang dibuat dari `values` formulir akan selalu memenuhi semua properti wajib dari `CreateUpdateStudentRequest`, meskipun skema Zod sudah mengaturnya. Saya akan membuat objek `payload` secara eksplisit untuk memastikan semua properti wajib ada.
2.  **`src/pages/manajemen-santri/SantriFormPage.tsx`**: Kesalahan ini muncul karena properti opsional seperti `born_in` dan `born_at` dari data API (`StudentDetailData`) bisa berupa `undefined`, tetapi tipe `initialData` di `SantriFormProps` (yang digunakan oleh `SantriFormPage`) mengharapkan `string | null`. Saya akan memperbarui tipe `initialData` di `SantriForm.tsx` agar properti-properti tersebut juga dapat menerima `undefined`.
3.  **`src/App.tsx`**: Kesalahan ini terjadi karena komponen `ThemeProvider` digunakan tetapi belum diimpor. Saya akan menambahkan pernyataan `import` yang diperlukan.

Berikut adalah perubahan yang akan saya lakukan:

<dyad-write path="src/pages/manajemen-santri/SantriForm.tsx" description="Memperbaiki tipe `initialData` agar sesuai dengan data API dan membuat payload secara eksplisit.">
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { useCreateStudentMutation, useUpdateStudentMutation, type CreateUpdateStudentRequest } from '@/store/slices/studentApi';
import { useGetProgramsQuery } from '@/store/slices/programApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

const formSchema = z.object({
  first_name: z.string().min(2, {
    message: 'Nama depan harus minimal 2 karakter.',
  }),
  last_name: z.string().nullable().optional(),
  nis: z.string().min(1, {
    message: 'NIS tidak boleh kosong.',
  }),
  nik: z.string().nullable().optional(),
  period: z.string().min(1, {
    message: 'Periode tidak boleh kosong.',
  }),
  gender: z.enum(['L', 'P'], {
    required_error: 'Jenis kelamin harus dipilih.',
  }),
  status: z.string().min(1, {
    message: 'Status tidak boleh kosong.',
  }),
  program_id: z.number({
    required_error: 'Program harus dipilih.',
  }),
  born_in: z.string().nullable().optional(),
  born_at: z.date().nullable().optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  photo: z.string().url({ message: 'URL foto tidak valid.' }).nullable().optional(),
});

interface SantriFormProps {
  initialData?: {
    id: number;
    first_name: string;
    last_name: string | null;
    nis: string;
    nik: string | null;
    period: string;
    gender: 'L' | 'P';
    status: string;
    program: { id: number; name: string }; // Nested program object
    born_in?: string; // Changed to allow undefined, matching API
    born_at?: string; // Changed to allow undefined, matching API
    address?: string; // Changed to allow undefined, matching API
    phone?: string; // Changed to allow undefined, matching API
    photo?: string; // Changed to allow undefined, matching API
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const SantriForm: React.FC<SantriFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation();
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
  const { data: programsData, isLoading: isLoadingPrograms } = useGetProgramsQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      first_name: initialData.first_name,
      last_name: initialData.last_name,
      nis: initialData.nis,
      nik: initialData.nik,
      period: initialData.period,
      gender: initialData.gender,
      status: initialData.status,
      program_id: initialData.program.id,
      born_in: initialData.born_in,
      born_at: initialData.born_at ? new Date(initialData.born_at) : null,
      address: initialData.address,
      phone: initialData.phone,
      photo: initialData.photo,
    } : {
      first_name: '',
      last_name: null,
      nis: '',
      nik: null,
      period: '',
      gender: 'L', // Default to Male
      status: 'Aktif', // Default status
      program_id: undefined,
      born_in: null,
      born_at: null,
      address: null,
      phone: null,
      photo: null,
    },
  });

  const availablePrograms = programsData || [];
  const studentStatuses = ['Aktif', 'Non-Aktif', 'Lulus', 'Cuti'];

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload: CreateUpdateStudentRequest = {
      first_name: values.first_name,
      last_name: values.last_name,
      nis: values.nis,
      nik: values.nik,
      period: values.period,
      gender: values.gender,
      status: values.status,
      program_id: values.program_id,
      born_in: values.born_in,
      born_at: values.born_at ? format(values.born_at, 'yyyy-MM-dd') : null,
      address: values.address,
      phone: values.phone,
      photo: values.photo,
    };

    try {
      if (initialData) {
        await updateStudent({ id: initialData.id, data: payload }).unwrap();
        toast.success(`Data santri "${values.first_name} ${values.last_name || ''}" berhasil diperbarui.`);
      } else {
        await createStudent(payload).unwrap();
        toast.success(`Santri "${values.first_name} ${values.last_name || ''}" berhasil ditambahkan.`);
      }
      onSuccess();
    } catch (err: unknown) {
      let errorMessage = 'Terjadi kesalahan tidak dikenal.';

      if (typeof err === 'object' && err !== null) {
        if ('status' in err) {
          const fetchError = err as FetchBaseQueryError;
          if (typeof fetchError.status === 'number') {
            if (fetchError.data && typeof fetchError.data === 'object' && 'message' in fetchError.data) {
              errorMessage = (fetchError.data as { message: string }).message;
            } else {
              errorMessage = `Error ${fetchError.status}: ${JSON.stringify(fetchError.data || {})}`;
            }
          } else if (typeof fetchError.status === 'string' && 'error' in fetchError) {
            errorMessage = fetchError.error;
          } else {
            errorMessage = `Error: ${JSON.stringify(fetchError)}`;
          }
        } else if ('message' in err && typeof (err as SerializedError).message === 'string') {
          errorMessage = (err as SerializedError).message;
        } else {
          errorMessage = `Terjadi kesalahan: ${JSON.stringify(err)}`;
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      toast.error(`Gagal menyimpan data santri: ${errorMessage}`);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Depan</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Ahmad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Belakang (Opsional)</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Fulan" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIS</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: 2023001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nik"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIK (Opsional)</Label>
                <FormControl>
                  <Input placeholder="Contoh: 3273xxxxxxxxxxxxxx" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Kelamin</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="L">Laki-Laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {studentStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="program_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Program</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value, 10))} value={field.value ? String(field.value) : ''} disabled={isLoadingPrograms}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih program..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingPrograms ? (
                      <div className="p-2">Memuat program...</div>
                    ) : (
                      availablePrograms.map((program) => (
                        <SelectItem key={program.id} value={String(program.id)}>
                          {program.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="period"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Periode</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: 2023/2024" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="born_in"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tempat Lahir (Opsional)</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Bandung" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="born_at"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tanggal Lahir (Opsional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: localeId })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      locale={localeId}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat (Opsional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Alamat lengkap santri..." {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telepon (Opsional)</Label>
                <FormControl>
                  <Input placeholder="Contoh: 081234567890" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="photo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Foto (Opsional)</Label>
                <FormControl>
                  <Input placeholder="https://example.com/foto.jpg" {...field} value={field.value || ''} />
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Santri')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SantriForm;