"use client";

import { useState, useMemo } from "react";
import { addDays, startOfWeek, endOfWeek, format, isSameDay, isWithinInterval } from "date-fns";
import { it } from "date-fns/locale";
import AppointmentCard from "./AppointmentCard";
import { Appointment } from "@prisma/client";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface WeekCalendarProps {
  appointments: (Appointment & {
    customer?: { firstName: string; lastName: string } | null;
    vehicle?: { plate: string; brand: string; modelName: string } | null;
  })[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onSlotClick?: (startAt: Date) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export default function WeekCalendar({ 
  appointments, 
  onAppointmentClick, 
  onSlotClick,
  currentDate,
  onDateChange 
}: WeekCalendarProps) {
  const [filter, setFilter] = useState<string>("ALL");

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]); // Lunedi
  const weekDays = useMemo(() => Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)), [weekStart]); // Lun-Ven (no sabato)

  const hours = Array.from({ length: 21 }, (_, i) => i + 8); // 8:00 - 20:00

  const filteredAppointments = useMemo(() => {
    if (filter === "ALL") return appointments;
    return appointments.filter(a => a.type === filter);
  }, [appointments, filter]);

  const getAppointmentsForDayAndHour = (day: Date, hour: number) => {
    return filteredAppointments.filter(a => {
      const start = new Date(a.startAt);
      return isSameDay(start, day) && start.getHours() === hour;
    });
  };

  const goToToday = () => onDateChange(new Date());
  const goToPreviousWeek = () => onDateChange(addDays(currentDate, -7));
  const goToNextWeek = () => onDateChange(addDays(currentDate, 7));

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={goToPreviousWeek}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          
          <button 
            onClick={goToToday}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold transition-colors"
          >
            <CalendarIcon size={16} />
            Oggi
          </button>
          
          <button 
            onClick={goToNextWeek}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="text-foreground" />
          </button>
          
          <h2 className="text-foreground font-bold">
            {format(weekStart, "d MMMM", { locale: it })} - {format(addDays(weekStart, 5), "d MMMM yyyy", { locale: it })}
          </h2>
        </div>

        {/* Filter */}
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:border-primary outline-none"
        >
          <option value="ALL">Tutti</option>
          <option value="SCHEDULED_WORK">Lavori programmati</option>
          <option value="DIAGNOSTIC">Diagnostica</option>
          <option value="PICKUP">Ritiri</option>
          <option value="OTHER">Altro</option>
        </select>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day headers */}
          <div className="grid grid-cols-[80px_repeat(6,1fr)] border-b border-border">
            <div className="p-2 text-center text-xs text-muted-foreground">Ora</div>
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="p-2 text-center border-l border-border">
                <p className="text-xs text-muted-foreground">{format(day, "EEE", { locale: it })}</p>
                <p className="text-lg font-bold text-foreground">{format(day, "d")}</p>
              </div>
            ))}
          </div>

          {/* Time slots */}
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-[80px_repeat(6,1fr)] border-b border-border hover:bg-white/[0.02]">
              <div className="p-2 text-right text-xs text-muted-foreground border-r border-border">
                {hour}:00
              </div>
              {weekDays.map((day) => {
                const dayAppointments = getAppointmentsForDayAndHour(day, hour);
                return (
                  <div 
                    key={day.toISOString()} 
                    className="p-1 border-l border-border min-h-[60px] cursor-pointer hover:bg-white/[0.02]"
                    onClick={() => {
                      const slotDate = new Date(day);
                      slotDate.setHours(hour, 0, 0, 0);
                      onSlotClick?.(slotDate);
                    }}
                  >
                    {dayAppointments.map((apt) => (
                      <AppointmentCard
                        key={apt.id}
                        appointment={apt}
                        onClick={() => onAppointmentClick?.(apt)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
