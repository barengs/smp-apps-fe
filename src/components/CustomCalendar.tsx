"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, DayPickerSingleProps } from "react-day-picker";
import { format, getYear, getMonth, setYear, setMonth, addYears, subYears } from "date-fns";
import { id } from 'date-fns/locale';

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

type View = "days" | "months" | "years";

export type CustomCalendarProps = DayPickerSingleProps;

function CustomCalendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CustomCalendarProps) {
  const [view, setView] = React.useState<View>("days");
  const [displayDate, setDisplayDate] = React.useState(props.selected || props.defaultMonth || new Date());

  const handleYearClick = () => setView("years");
  const handleMonthClick = () => setView("months");

  const onYearSelect = (year: number) => {
    setDisplayDate(setYear(displayDate, year));
    setView("months");
  };

  const onMonthSelect = (monthIndex: number) => {
    setDisplayDate(setMonth(displayDate, monthIndex));
    setView("days");
  };

  const currentYear = getYear(displayDate);
  const startOfDecade = Math.floor(currentYear / 10) * 10;

  const goToPreviousDecade = () => setDisplayDate(subYears(displayDate, 10));
  const goToNextDecade = () => setDisplayDate(addYears(displayDate, 10));
  const goToPreviousYear = () => setDisplayDate(subYears(displayDate, 1));
  const goToNextYear = () => setDisplayDate(addYears(displayDate, 1));

  const renderYearsView = () => {
    const years = Array.from({ length: 12 }, (_, i) => startOfDecade - 1 + i);
    return (
      <div className="p-3">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={goToPreviousDecade}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            {startOfDecade} - {startOfDecade + 9}
          </div>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={goToNextDecade}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {years.map((year) => (
            <Button
              key={year}
              variant="ghost"
              onClick={() => onYearSelect(year)}
              className={cn(
                "text-center text-sm",
                year === getYear(props.selected || new Date()) && "bg-accent text-accent-foreground"
              )}
            >
              {year}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthsView = () => {
    const months = Array.from({ length: 12 }, (_, i) => i);
    return (
      <div className="p-3">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={goToPreviousYear}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" className="font-semibold" onClick={handleYearClick}>
            {getYear(displayDate)}
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={goToNextYear}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((monthIndex) => (
            <Button
              key={monthIndex}
              variant="ghost"
              onClick={() => onMonthSelect(monthIndex)}
              className={cn(
                "text-center text-sm",
                monthIndex === getMonth(props.selected || new Date()) && getYear(displayDate) === getYear(props.selected || new Date()) && "bg-accent text-accent-foreground"
              )}
            >
              {format(new Date(0, monthIndex), "MMM", { locale: id })}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderDaysView = () => (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        nav: "space-x-1 flex items-center",
        nav_button: cn(buttonVariants({ variant: "outline" }), "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption: ({ displayMonth }) => (
          <div className="flex justify-center pt-1 relative items-center gap-1">
            <Button variant="ghost" className="font-semibold" onClick={handleMonthClick}>
              {format(displayMonth, "MMMM", { locale: id })}
            </Button>
            <Button variant="ghost" className="font-semibold" onClick={handleYearClick}>
              {format(displayMonth, "yyyy", { locale: id })}
            </Button>
          </div>
        ),
      }}
      month={displayDate}
      onMonthChange={setDisplayDate}
      {...props}
    />
  );

  if (view === "years") return renderYearsView();
  if (view === "months") return renderMonthsView();
  return renderDaysView();
}
CustomCalendar.displayName = "CustomCalendar";

export { CustomCalendar };