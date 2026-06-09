"use client";

import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import WeekCalendar from "./WeekCalendar";

type WeekCalendarProps = ComponentProps<typeof WeekCalendar>;

interface WeekCalendarClientProps {
  appointments: WeekCalendarProps["appointments"];
  currentDate: Date;
}

// Wrapper client per WeekCalendar: gestisce la navigazione tra le settimane.
// onDateChange è un event handler, quindi DEVE vivere in un Client Component
// (i Server Component non possono passare funzioni ai Client Component).
// Aggiorna la querystring ?date=... così la pagina server ricarica gli
// appuntamenti della settimana selezionata.
export default function WeekCalendarClient({ appointments, currentDate }: WeekCalendarClientProps) {
  const router = useRouter();

  function handleDateChange(newDate: Date) {
    const iso = newDate.toISOString().split("T")[0]; // YYYY-MM-DD
    router.push(`/admin/calendar?date=${iso}`);
  }

  return (
    <WeekCalendar
      appointments={appointments}
      currentDate={currentDate}
      onDateChange={handleDateChange}
    />
  );
}
