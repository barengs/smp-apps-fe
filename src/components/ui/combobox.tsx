"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { extractNisFromScan } from '@/utils/scanUtils';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxOption {
  value: string | number;
  label: string;
  keywords?: string[];
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  notFoundMessage?: string;
  disabled?: boolean;
  isLoading?: boolean;
  allowCustomValue?: boolean;
  onSearchChange?: (search: string) => void;
  shouldFilter?: boolean;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  notFoundMessage = "No option found.",
  disabled = false,
  isLoading = false,
  allowCustomValue = false,
  onSearchChange,
  shouldFilter = true,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedLabel, setSelectedLabel] = React.useState<string>("")
  const [searchValue, setSearchValue] = React.useState<string>("")

  React.useEffect(() => {
    if (value !== undefined && options) {
      const selectedOption = options.find((option) => option.value === value)
      setSelectedLabel(selectedOption ? selectedOption.label : (allowCustomValue ? String(value) : ""))
    } else {
      setSelectedLabel("")
    }
  }, [value, options])

  // Show loading state
  if (isLoading) {
    return (
      <Button
        variant="outline"
        role="combobox"
        className="w-full justify-between"
        disabled={true}
      >
        Loading...
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    )
  }

  return (
    <Popover 
      open={open} 
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setSearchValue("");
          onSearchChange?.("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedLabel || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-1">
        <Command shouldFilter={shouldFilter}>
          <CommandInput 
            placeholder={searchPlaceholder} 
            value={searchValue}
            onValueChange={(val) => {
              const processed = extractNisFromScan(val);
              setSearchValue(processed);
              onSearchChange?.(processed);
            }}
          />
          <CommandList>
            <CommandEmpty>
              {allowCustomValue && searchValue ? (
                <div
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    onChange(searchValue)
                    setOpen(false)
                    setSearchValue("")
                    onSearchChange?.("")
                  }}
                >
                  Gunakan "{searchValue}"
                </div>
              ) : notFoundMessage}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const searchKeywords = option.keywords && option.keywords.length > 0
                  ? ' ' + option.keywords.join(' ')
                  : '';
                const searchString = `${option.label}${searchKeywords}`;
                return (
                  <CommandItem
                    key={option.value}
                    value={shouldFilter ? searchString : String(option.value)}
                    onSelect={() => {
                      onChange(option.value)
                      setOpen(false)
                      setSearchValue("")
                      onSearchChange?.("")
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                );
              })}
              {allowCustomValue && searchValue && !options.some(o => String(o.value).toLowerCase() === searchValue.toLowerCase() || o.label.toLowerCase().includes(searchValue.toLowerCase())) && (
                <CommandItem
                  value={searchValue}
                  onSelect={() => {
                    onChange(searchValue)
                    setOpen(false)
                    setSearchValue("")
                    onSearchChange?.("")
                  }}
                >
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  Gunakan "{searchValue}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}