import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Kegiatan } from '@/pages/manajemen-pendidikan/JadwalKegiatanPage';

interface EventCalendarProps {
  kegiatanList: Kegiatan[];
  onDateClick: (date: Date) => void;
}

const EventCalendar: React.FC<EventCalendarProps> = ({ kegiatanList, onDateClick }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const weekdays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy', { locale: id })}
        </h2>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 text-center text-sm font-medium text-muted-foreground">
        {weekdays.map(day => (
          <div key={day} className="py-2 border-b">{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          const eventsOnDay = kegiatanList.filter(k => isSameDay(k.date, day));

          return (
            <div
              key={day.toString()}
              className={cn(
                "h-32 border-b p-2 flex flex-col cursor-pointer hover:bg-accent transition-colors",
                !isCurrentMonth && "text-muted-foreground bg-muted/50",
                (index + 1) % 7 !== 0 && "border-r" // Add right border to all but the last column
              )}
              onClick={() => onDateClick(day)}
            >
              <span className={cn(
                "font-medium self-end",
                isToday && "bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center"
              )}>
                {format(day, 'd')}
              </span>
              <div className="flex-grow overflow-y-auto mt-1 space-y-1">
                {eventsOnDay.map(event => (
                  <div key={event.id} className="bg-primary/10 text-primary text-xs p-1 rounded truncate">
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventCalendar;