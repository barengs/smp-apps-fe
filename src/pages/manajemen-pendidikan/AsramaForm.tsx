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
import * as toast from '@/utils/toast';
import { useCreateHostelMutation, useUpdateHostelMutation, type CreateUpdateHostelRequest } from '@/store/slices/hostelApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Nama Asrama harus minimal 2 karakter.',
  }),
  description: z.string().optional(),
});

interface AsramaFormProps {
  initialData?: {
    id: number;
    name: string;
    description: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const AsramaForm: React.<dyad-problem-report summary="64 problems">
<problem file="src/pages/manajemen-staf/StaffForm.tsx" line="88" column="15" code="2339">Property 'success' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-staf/StaffForm.tsx" line="92" column="15" code="2339">Property 'success' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-staf/StaffForm.tsx" line="121" column="13" code="2339">Property 'error' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/components/DataTable.tsx" line="109" column="11" code="2339">Property 'info' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/components/DataTable.tsx" line="132" column="13" code="2339">Property 'error' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/components/DataTable.tsx" line="151" column="11" code="2339">Property 'success' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/components/DataTable.tsx" line="159" column="11" code="2339">Property 'info' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/components/DataTable.tsx" line="176" column="13" code="2339">Property 'error' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/components/DataTable.tsx" line="184" column="11" code="2339">Property 'success' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-staf/StaffImportDialog.tsx" line="46" column="11" code="2339">Property 'success' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-staf/StaffImportDialog.tsx" line="51" column="13" code="2339">Property 'error' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-staf/StaffImportDialog.tsx" line="55" column="32" code="2339">Property 'loading' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-staf/StaffImportDialog.tsx" line="66" column="13" code="2339">Property 'dismiss' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-staf/StaffImportDialog.tsx" line="67" column="13" code="2339">Property 'success' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-staf/HakAksesForm.tsx" line="59" column="15" code="2339">Property 'success' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-staf/HakAksesForm.tsx" line="62" column="15" code="2339">Property 'success' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-staf/HakAksesForm.tsx" line="79" column="13" code="2339">Property 'error' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-staf/HakAksesTable.tsx" line="74" column="15" code="2339">Property 'success' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-staf/HakAksesTable.tsx" line="78" column="15" code="2339">Property 'error' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-staf/PeranForm.tsx" line="78" column="15" code="2339">Property 'success' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-staf/PeranForm.tsx" line="81" column="15" code="2339">Property 'success' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-staf/PeranForm.tsx" line="110" column="13" code="2339">Property 'error' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-staf/PeranTable.tsx" line="99" column="15" code="2339">Property 'success' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-staf/PeranTable.tsx" line="114" column="15" code="2339">Property 'error' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-santri/SantriTable.tsx" line="90" column="25" code="2339">Property 'info' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-santri/WaliSantriTable.tsx" line="84" column="25" code="2339">Property 'info' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-santri/WaliSantriTable.tsx" line="94" column="25" code="2339">Property 'error' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-santri/WaliSantriTable.tsx" line="108" column="11" code="2339">Property 'info' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-staf/StaffDetailPage.tsx" line="26" column="11" code="2339">Property 'error' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-staf/StaffDetailPage.tsx" line="75" column="11" code="2339">Property 'error' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-santri/SantriDetailPage.tsx" line="31" column="11" code="2339">Property 'error' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-santri/SantriDetailPage.tsx" line="43" column="13" code="2339">Property 'success' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-santri/SantriDetailPage.tsx" line="53" column="11" code="2339">Property 'info' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-santri/SantriDetailPage.tsx" line="96" column="11" code="2339">Property 'error' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/data-wilayah/ProvinsiForm.tsx" line="60" column="15" code="2339">Property 'success' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/data-wilayah/ProvinsiForm.tsx" line="63" column="15" code="2339">Property 'success' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/data-wilayah/ProvinsiForm.tsx" line="80" column="13" code="2339">Property 'error' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/data-wilayah/KotaForm.tsx" line="70" column="15" code="2339">Property 'success' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/data-wilayah/KotaForm.tsx" line="73" column="15" code="2339">Property 'success' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/data-wilayah/KotaForm.tsx" line="90" column="13" code="2339">Property 'error' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/data-wilayah/DesaForm.tsx" line="69" column="15" code="2339">Property 'success' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/data-wilayah/DesaForm.tsx" line="72" column="15" code="2339">Property 'success' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/data-wilayah/DesaForm.tsx" line="89" column="13" code="2339">Property 'error' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-santri/WaliSantriDetailPage.tsx" line="26" column="11" code="2339">Property 'error' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-santri/WaliSantriDetailPage.tsx" line="75" column="11" code="2339">Property 'error' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-santri/WaliSantriDetailPage.tsx" line="92" column="64" code="2339">Property 'info' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-pendidikan/ProgramForm.tsx" line="59" column="15" code="2339">Property 'success' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-pendidikan/ProgramForm.tsx" line="62" column="15" code="2339">Property 'success' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-pendidikan/ProgramForm.tsx" line="79" column="13" code="2339">Property 'error' does not exist on type 'typeof import(&quot;/Users/ROFI/dyad-apps/smp-apps/src/utils/toast&quot;)'.</problem>
<problem file="src/pages/manajemen-pendidikan/AsramaForm.tsx" line="16" column="10" code="2459">Module '&quot;@/utils/toast&quot;' declares 'toast' locally, but it is not exported.</problem>
<problem file="src/pages/manajemen-pendidikan/AsramaTable.tsx" line="5" column="10" code="2459">Module '&quot;@/utils/toast&quot;' declares 'toast' locally, but it is not exported.</problem>
<problem file="src/pages/manajemen-pendidikan/JenjangPendidikanForm.tsx" line="16" column="10" code="2459">Module '&quot;@/utils/toast&quot;' declares 'toast' locally, but it is not exported.</problem>
<problem file="src/pages/manajemen-pendidikan/JenjangPendidikanTable.tsx" line="5" column="10" code="2459">Module '&quot;@/utils/toast&quot;' declares 'toast' locally, but it is not exported.</problem>
<problem file="src/pages/manajemen-pendidikan/KelasForm.tsx" line="23" column="10" code="2459">Module '&quot;@/utils/toast&quot;' declares 'toast' locally, but it is not exported.</problem>
<problem file="src/pages/manajemen-pendidikan/KelasTable.tsx" line="27" column="10" code="2459">Module '&quot;@/utils/toast&quot;' declares 'toast' locally, but it is not exported.</problem>
<problem file="src/pages/manajemen-pendidikan/JadwalKegiatanPage.tsx" line="9" column="10" code="2459">Module '&quot;@/utils/toast&quot;' declares 'toast' locally, but it is not exported.</problem>
<problem file="src/pages/manajemen-pendidikan/RombelForm.tsx" line="22" column="10" code="2459">Module '&quot;@/utils/toast&quot;' declares 'toast' locally, but it is not exported.</problem>
<problem file="src/pages/manajemen-pendidikan/RombelTable.tsx" line="5" column="10" code="2459">Module '&quot;@/utils/toast&quot;' declares 'toast' locally, but it is not exported.</problem>
<problem file="src/pages/utility/SystemSettingsPage.tsx" line="18" column="10" code="2459">Module '&quot;@/utils/toast&quot;' declares 'toast' locally, but it is not exported.</problem>
<problem file="src/pages/utility/MenuForm.tsx" line="23" column="10" code="2459">Module '&quot;@/utils/toast&quot;' declares 'toast' locally, but it is not exported.</problem>
<problem file="src/pages/manajemen-santri/ParentFormStep.tsx" line="23" column="10" code="2459">Module '&quot;@/utils/toast&quot;' declares 'toast' locally, but it is not exported.</problem>
<problem file="src/pages/manajemen-santri/SantriWizardForm.tsx" line="2" column="10" code="2459">Module '&quot;@/utils/toast&quot;' declares 'toast' locally, but it is not exported.</problem>
<problem file="src/pages/manajemen-santri/SantriFormPage.tsx" line="8" column="10" code="2459">Module '&quot;@/utils/toast&quot;' declares 'toast' locally, but it is not exported.</problem>
<problem file="src/components/ui/use-toast.ts" line="1" column="33" code="2307">Cannot find module '@/hooks/use-toast' or its corresponding type declarations.</problem>
</dyad-problem-report><think>**Fixing TypeScript Issues**

I'm currently focused on resolving the 64 TypeScript compilation errors. Two primary error categories stand out: those related to missing 'success' properties and those stemming from the inability to find certain modules, leading to "cannot find module" errors. I'm prioritizing the 'success' property issues, systematically checking imports and type definitions to ensure everything aligns with expected properties and types. Once those are fixed, I'll deal with the module errors.


**Resolving Toast Imports**

I'm making progress. I've pinpointed that the 'success' property errors arise from incorrect import styles. My fix involves converting named imports of `toast` functions to namespace imports (`import * as toast from '@/utils/toast'`) and updating all calls to use the correct function names (e.g., `toast.showSuccess()`). This should address both the 'success' property and the "module not exported" errors simultaneously.


**Updating Import Styles**

I've been meticulously correcting the import styles and function calls across numerous files to eradicate the "success" property errors. This involves converting named imports to namespace imports for the toast utilities. Simultaneously, I'm refactoring the function calls, ensuring each call uses the correct named export, like `toast.showSuccess()` instead of `toast.success()`. I've also identified and will remove `src/components/ui/use-toast.ts` as obsolete after the toast migration.


**Refining Toast Migrations**

Currently, I'm working to eradicate the last of the TypeScript errors, and my focus is now on ensuring proper function calls within files that import the toast utilities. My fix involves standardizing all calls to the correct function names, such as `toast.showSuccess()` in place of the incorrect `toast.success()`. Additionally, I've confirmed that the obsolete `src/components/ui/use-toast.ts` can be deleted, streamlining the codebase and fixing the last TS2307 error. This should resolve all the remaining issues.


</think>Anda benar, ada beberapa kesalahan yang perlu diperbaiki terkait penggunaan `toast`. Kesalahan `TS2339` terjadi karena fungsi-fungsi `toast` diimpor sebagai objek `toast` (`* as toast`), tetapi kemudian dipanggil dengan nama properti yang tidak ada (misalnya `toast.success` alih-alih `toast.showSuccess`). Kesalahan `TS2459` adalah efek samping dari ini, dan `TS2307` menunjukkan bahwa file `use-toast.ts` masih ada dan mencoba mengimpor modul yang sudah dihapus.

Saya akan memperbaiki semua kesalahan ini dengan:

1.  Mengubah semua panggilan `toast.success`, `toast.error`, `toast.info`, `toast.loading`, dan `toast.dismiss` menjadi `toast.showSuccess`, `toast.showError`, `toast.showWarning`, `toast.showLoading`, dan `toast.dismissToast` di semua file yang terpengaruh.
2.  Menghapus file `src/components/ui/use-toast.ts` karena tidak lagi relevan dan menyebabkan kesalahan.

Berikut adalah perubahan yang akan saya terapkan:

<dyad-write path="src/pages/manajemen-staf/StaffForm.tsx" description="Memperbaiki panggilan fungsi toast.">
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
import * as toast from '@/utils/toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useCreateEmployeeMutation, useUpdateEmployeeMutation } from '@/store/slices/employeeApi';
import { useGetRolesQuery } from '@/store/slices/roleApi'; // Import hook to get roles
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

// Import CreateUpdateEmployeeRequest untuk penegasan tipe
import type { CreateUpdateEmployeeRequest } from '@/store/slices/employeeApi';

const formSchema = z.object({
  first_name: z.string().min(2, {
    message: 'Nama depan harus minimal 2 karakter.',
  }),
  last_name: z.string().min(2, {
    message: 'Nama belakang harus minimal 2 karakter.',
  }),
  email: z.string().email({
    message: 'Email tidak valid.',
  }),
  role_ids: z.array(z.number()).min(1, {
    message: 'Pilih minimal satu peran.',
  }),
});

interface StaffFormProps {
  initialData?: {
    id: number;
    employee: { // Updated to match nested structure
      first_name: string;
      last_name: string;
    };
    email: string;
    roles: { id: number; name: string; guard_name: string }[];
    fullName: string; // Also include fullName if it's passed from table
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const StaffForm: React.FC<StaffFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();
  const { data: rolesData, isLoading: isLoadingRoles } = useGetRolesQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      first_name: initialData.employee.first_name, // Access nested employee
      last_name: initialData.employee.last_name,   // Access nested employee
      email: initialData.email,
      role_ids: initialData.roles.map(role => role.id), // Map existing roles to their IDs
    } : {
      first_name: '',
      last_name: '',
      email: '',
      role_ids: [],
    },
  });

  const availableRoles = rolesData?.data || [];

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (initialData) {
        // Penegasan tipe eksplisit di sini
        await updateEmployee({ id: initialData.id, data: values as CreateUpdateEmployeeRequest }).unwrap();
        toast.showSuccess(`Staf "${values.first_name} ${values.last_name}" berhasil diperbarui.`);
      } else {
        // Penegasan tipe eksplisit di sini
        await createEmployee(values as CreateUpdateEmployeeRequest).unwrap();
        toast.showSuccess(`Staf "${values.first_name} ${values.last_name}" berhasil ditambahkan.`);
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

      toast.showError(`Gagal menyimpan staf: ${errorMessage}`);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Depan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Budi" {...field} />
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
              <FormLabel>Nama Belakang</FormLabel> {/* Corrected closing tag */}
              <FormControl>
                <Input placeholder="Contoh: Santoso" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="contoh@pesantren.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role_ids"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Peran</FormLabel>
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
                      disabled={isLoadingRoles}
                    >
                      {isLoadingRoles ? "Memuat peran..." : (
                        field.value && field.value.length > 0
                          ? (
                              <div className="flex flex-wrap gap-1">
                                {field.value.map((roleId) => {
                                  const role = availableRoles.find(r => r.id === roleId);
                                  return role ? (
                                    <Badge key={role.id} variant="secondary">
                                      {role.name}
                                    </Badge>
                                  ) : null;
                                })}
                              </div>
                            )
                          : "Pilih peran..."
                      )}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Cari peran..." />
                    <CommandEmpty>Tidak ada peran ditemukan.</CommandEmpty>
                    <CommandGroup>
                      {availableRoles.map((role) => (
                        <CommandItem
                          key={role.id}
                          onSelect={() => {
                            const currentValues = new Set(field.value);
                            if (currentValues.has(role.id)) {
                              currentValues.delete(role.id);
                            } else {
                              currentValues.add(role.id);
                            }
                            field.onChange(Array.from(currentValues));
                          }}
                        >
                          <Checkbox
                            checked={field.value?.includes(role.id)}
                            onCheckedChange={(checked) => {
                              const currentValues = new Set(field.value);
                              if (checked) {
                                currentValues.add(role.id);
                              } else {
                                currentValues.delete(role.id);
                              }
                              field.onChange(Array.from(currentValues));
                            }}
                            className="mr-2"
                          />
                          {role.name}
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
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Staf')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default StaffForm;