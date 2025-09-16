import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value?: string; // Format HH:MM
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  placeholder,
  className,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, setHour] = useState<string>('00');
  const [minute, setMinute] = useState<string>('00');

  useEffect(() => {
    if (value && value.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      const [h, m] = value.split(':');
      setHour(h);
      setMinute(m);
    } else {
      setHour('00');
      setMinute('00');
    }
  }, [value]);

  const handleHourChange = (newHour: string) => {
    setHour(newHour);
    const newTime = `${newHour}:${minute}`;
    onChange?.(newTime);
  };

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute);
    const newTime = `${hour}:${newMinute}`;
    onChange?.(newTime);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Input
          value={value}
          placeholder={placeholder}
          className={cn("w-full", className)}
          readOnly // Mencegah pengetikan langsung, memaksa pemilihan
          onClick={() => setIsOpen(true)} // Membuka popover saat input diklik
          disabled={disabled}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="flex gap-2 p-2">
          <Select value={hour} onValueChange={handleHourChange} disabled={disabled}>
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="HH" />
            </SelectTrigger>
            <SelectContent>
              {hours.map((h) => (
                <SelectItem key={h} value={h}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="self-center">:</span>
          <Select value={minute} onValueChange={handleMinuteChange} disabled={disabled}>
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="MM" />
            </SelectTrigger>
            <SelectContent>
              {minutes.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TimePicker;