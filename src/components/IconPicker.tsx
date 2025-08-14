import * as React from 'react';
import { Check, ChevronsUpDown, Package } from 'lucide-react';
import * as lucideIcons from 'lucide-react'; // Mengganti nama import untuk kejelasan

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Menentukan objek ikon yang sebenarnya, mempertimbangkan kemungkinan nested 'icons' object
const allIcons = (lucideIcons as any).icons || lucideIcons;

// Secara dinamis mendapatkan semua nama ikon dari lucide-react, memfilter ekspor non-ikon
const iconNames = Object.keys(allIcons).filter(
  (key) =>
    typeof (allIcons as any)[key] === 'object' &&
    key !== 'createLucideIcon' &&
    key !== 'LucideIcon' &&
    key !== 'icons' && // Mengecualikan objek 'icons' itu sendiri jika ada
    key !== 'default' // Mengecualikan ekspor default jika ada
);

// Helper untuk merender ikon berdasarkan nama string-nya
const renderIcon = (name: string) => {
  const IconComponent = (allIcons as any)[name] as React.ElementType;
  if (!IconComponent) {
    return <Package className="h-4 w-4" />; // Ikon fallback
  }
  return <IconComponent className="h-4 w-4" />;
};

interface IconPickerProps {
  value?: string;
  onChange: (value: string | undefined) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (currentValue: string) => {
    // Jika ikon yang sama dipilih lagi, hapus nilainya. Jika tidak, atur nilai baru.
    onChange(currentValue === value ? undefined : currentValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <div className="flex items-center gap-2">
            {value ? renderIcon(value) : <Package className="h-4 w-4 opacity-50" />}
            {value ? value : 'Pilih ikon...'}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Cari ikon..." />
          <CommandList>
            <CommandEmpty>Ikon tidak ditemukan.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-y-auto">
              {iconNames.map((iconName) => (
                <CommandItem
                  key={iconName}
                  value={iconName}
                  onSelect={handleSelect}
                >
                  <div className="flex items-center gap-2">
                    {renderIcon(iconName)}
                    <span>{iconName}</span>
                  </div>
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      value === iconName ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};