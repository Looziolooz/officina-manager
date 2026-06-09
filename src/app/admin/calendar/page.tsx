import { Suspense } from "react";
import WeekCalendarClient from "@/components/calendar/WeekCalendarClient";
import { getAppointmentsInRange } from "@/app/actions/appointments";
import { addDays, startOfWeek, endOfWeek } from "date-fns";
import { Calendar, Plus } from "lucide-react";
import Link from "next/link";

interface CalendarPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const currentDate = params.date ? new Date(params.date) : new Date();
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  
  const { data: appointments = [] } = await getAppointmentsInRange(weekStart, weekEnd);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Calendar className="text-primary" size={32} />
            Calendario Appuntamenti
          </h1>
          <p className="text-gray-400 mt-2">Gestisci gli appuntamenti della settimana</p>
        </div>
        
        <Link
          href="/admin/calendar/new"
          className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-900/20"
        >
          <Plus size={20} />
          Nuovo Appuntamento
        </Link>
      </div>

      {/* Calendar */}
      <Suspense fallback={<div className="text-white">Caricamento calendario...</div>}>
        <WeekCalendarClient
          appointments={appointments}
          currentDate={currentDate}
        />
      </Suspense>
    </div>
  );
}
