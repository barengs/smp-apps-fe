"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetCitiesQuery } from "@/store/slices/cityApi";

interface CityComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const CityCombobox: React.FC<CityComboboxProps> = ({ value, onValueChange, disabled }) => {
  const [open, setOpen] = React.useState(false);
  const { data: cities, isLoading, isError } = useGetCitiesQuery();

  const selectedCityName = cities?.find((city) => city.code === value)?.name;

  if (isLoading) {
    return (
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between text-muted-foreground"
        disabled
      >
        Memuat kota...
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  if (isError) {
    return (
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between text-destructive"
        disabled
      >
        Gagal memuat kota
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value
            ? selectedCityName || "Pilih kota..."
            : "Pilih kota..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Cari kota..." />
          <CommandList>
            <CommandEmpty>Tidak ada kota ditemukan.</CommandEmpty>
            <CommandGroup>
              {cities?.map((city) => (
                <CommandItem
                  key={city.id}
                  value={city.name}
                  onSelect={() => {
                    onValueChange(city.code);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === city.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {city.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CityCombobox;