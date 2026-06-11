"use server";

import { prisma } from "@/lib/db";
import { AppointmentStatus, AppointmentType } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Orari officina (slot orari di inizio). Lun-Ven mattina+pomeriggio, Sab solo mattina.
const WEEKDAY_HOURS = [9, 10, 11, 12, 15, 16, 17];
const SATURDAY_HOURS = [9, 10, 11, 12];

interface Slot {
  startISO: string;
  label: string;
}

// Restituisce gli slot liberi di una data (orari officina meno appuntamenti già presi).
export async function getAvailableSlots(dateISO: string): Promise<Slot[]> {
  const date = new Date(dateISO);
  if (isNaN(date.getTime())) return [];

  const dow = date.getDay(); // 0 = domenica ... 6 = sabato
  if (dow === 0) return []; // domenica chiuso
  const hours = dow === 6 ? SATURDAY_HOURS : WEEKDAY_HOURS;

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const booked = await prisma.appointment.findMany({
    where: {
      startAt: { gte: dayStart, lt: dayEnd },
      status: { not: AppointmentStatus.CANCELLED },
    },
    select: { startAt: true, endAt: true },
  });

  const now = new Date();
  const slots: Slot[] = [];
  for (const h of hours) {
    const start = new Date(dayStart);
    start.setHours(h, 0, 0, 0);
    const end = new Date(start);
    end.setHours(h + 1);

    if (start.getTime() <= now.getTime()) continue; // niente slot passati
    const overlap = booked.some(
      (b) => start < new Date(b.endAt) && end > new Date(b.startAt)
    );
    if (!overlap) slots.push({ startISO: start.toISOString(), label: `${String(h).padStart(2, "0")}:00` });
  }
  return slots;
}

interface BookingInput {
  name: string;
  phone: string;
  plate: string;
  service?: string;
  notes?: string;
  startISO: string;
}

interface BookingResult {
  success: boolean;
  message: string;
}

// Crea una richiesta di appuntamento (status PLANNED) dal sito pubblico.
// L'officina la vede nel calendario admin e la conferma.
export async function createPublicBooking(input: BookingInput): Promise<BookingResult> {
  const name = (input.name || "").trim();
  const phone = (input.phone || "").replace(/[\s]/g, "").trim();
  const plate = (input.plate || "").trim().toUpperCase().replace(/\s+/g, "");

  if (name.length < 2) return { success: false, message: "Inserisci il tuo nome." };
  if (phone.length < 6) return { success: false, message: "Inserisci un numero di telefono valido." };

  const start = new Date(input.startISO);
  if (isNaN(start.getTime()) || start.getTime() <= Date.now()) {
    return { success: false, message: "Orario non valido. Scegli uno slot disponibile." };
  }
  const end = new Date(start);
  end.setHours(start.getHours() + 1);

  // createdById è obbligatorio: usiamo un amministratore.
  const admin = await prisma.user.findFirst({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
    select: { id: true },
  });
  if (!admin) return { success: false, message: "Prenotazione non disponibile al momento. Chiamaci pure." };

  // Ricontrollo disponibilità (lo slot potrebbe essere stato preso nel frattempo).
  const clash = await prisma.appointment.findFirst({
    where: {
      status: { not: AppointmentStatus.CANCELLED },
      startAt: { lt: end },
      endAt: { gt: start },
    },
    select: { id: true },
  });
  if (clash) return { success: false, message: "Questo orario è appena stato occupato. Scegline un altro." };

  // Anti-spam: una sola richiesta per numero nello stesso giorno.
  const dayStart = new Date(start);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  const already = await prisma.appointment.findFirst({
    where: { walkInPhone: phone, startAt: { gte: dayStart, lt: dayEnd } },
    select: { id: true },
  });
  if (already) return { success: false, message: "Hai già una richiesta per questo giorno: ti contatteremo a breve." };

  const service = (input.service || "").trim();
  const noteText = [service ? `Servizio richiesto: ${service}` : "", (input.notes || "").trim()]
    .filter(Boolean)
    .join(" — ") || null;
  const type = /diagnos/i.test(service) ? AppointmentType.DIAGNOSTIC : AppointmentType.SCHEDULED_WORK;

  try {
    await prisma.appointment.create({
      data: {
        startAt: start,
        endAt: end,
        type,
        status: AppointmentStatus.PLANNED,
        notes: noteText,
        walkInName: name,
        walkInPhone: phone,
        walkInPlate: plate || null,
        createdById: admin.id,
      },
    });
    revalidatePath("/admin/calendar");
    return { success: true, message: "Richiesta inviata! Ti contatteremo per confermare l'appuntamento." };
  } catch (e) {
    console.error("[booking] errore creazione:", e);
    return { success: false, message: "Errore durante la prenotazione. Riprova o chiamaci." };
  }
}
