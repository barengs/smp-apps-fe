import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Kegiatan } from '@/pages/manajemen-pendidikan/JadwalKegiatanPage';

interface EventCalendarProps {
  kegiatanList: Kegiatan[];
  onDateClick: (date: Date) => void;
}

const EventCalendar: React.FC<EventCalendarProps> = ({ kegiatanList, onDateClick }) => {
  const modifiers = {
    events: kegiatanList.map(kegiatan => kegiatan.date),
  };

  const modifiersClassNames = {
    events: 'bg-blue-500 text-white rounded-full',
  };

  return (
    <Calendar
      mode="single"
      selected={null} // Calendar doesn't select a single date, just highlights events
      onSelect={onDateClick}
      modifiers={modifiers}
      modifiersClassNames={modifiersClassNames}
      locale={id}
      className="rounded-md border shadow"
    />
  );
};

export default EventCalendar;