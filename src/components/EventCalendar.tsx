import React, { useState, useMemo } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday } from 'date-fns';
import { id } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Kegiatan } from '@/pages/manajemen-pendidikan/JadwalKegiatanPage';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface EventCalendarProps {
  kegiatanList: Kegiatan[];
  onDateClick: (date: Date) => void;
  onEventClick: (kegiatan: Kegiatan) => void;
}

const EventCalendar: React.FC<EventCalendarProps> = ({ kegiatanList, onDateClick, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const eventsByDate = useMemo(() => {
    return kegiatanList.reduce((acc, kegiatan) => {
      const dateKey = format(kegiatan.date, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(kegiatan);
      return acc;
    }, {} as Record<string, Kegiatan[]>);
  }, [kegiatanList]);

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  
  // Sunday is 0, Monday is 1, etc. We want Monday to be the start of the week.
  const startingDayIndex = (getDay(firstDayOfMonth) + 6) % 7;

  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const daysOfWeek = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <div className="p-3 bg-card text-card-foreground rounded-lg border shadow">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">
          {format(currentDate, 'MMMM yyyy', { locale: id })}
        </h2>
        <Button variant="outline" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-px bg-border">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center font-medium text-sm py-2 bg-card">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border">
        {Array.from({ length: startingDayIndex }).map((_, index) => (
          <div key={`empty-${index}`} className="bg-muted/50"></div>
        ))}
        {daysInMonth.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDate[dateKey] || [];
          return (
            <div
              key={day.toString()}
              className="relative p-2 h-28 bg-card hover:bg-accent/50 transition-colors duration-200 cursor-pointer flex flex-col"
              onClick={() => onDateClick(day)}
            >
              <span className={cn(
                "font-medium",
                !isSameMonth(day, currentDate) && "text-muted-foreground",
                isToday(day) && "bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center"
              )}>
                {format(day, 'd')}
              </span>
              <div className="mt-1 overflow-y-auto flex-grow">
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent onDateClick from firing
                      onEventClick(event);
                    }}
                    className="text-xs p-1 mb-1 rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 truncate"
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    + {dayEvents.length - 2} lainnya
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventCalendar;