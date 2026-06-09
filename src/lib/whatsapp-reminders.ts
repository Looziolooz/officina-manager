import { prisma } from "@/lib/db";
import { sendWhatsApp } from "@/lib/whatsapp";
import { SMSType, SMSProvider, SMSStatus } from "@prisma/client";

export interface ReminderRunResult {
  due: number;
  sent: number;
  skipped: number;
  failed: number;
  details: string[];
}

// Trova i veicoli con tagliando o revisione in scadenza entro `withinDays` giorni
// e invia un promemoria WhatsApp al proprietario. Una sola fonte di verità: il DB.
// Dedup: non reinvia lo stesso tipo di promemoria allo stesso cliente entro la finestra.
export async function sendServiceReminders(withinDays = 7): Promise<ReminderRunResult> {
  const now = new Date();
  const until = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);
  const dedupeSince = new Date(now.getTime() - withinDays * 24 * 60 * 60 * 1000);

  const vehicles = await prisma.vehicle.findMany({
    where: {
      OR: [
        { inspectionReminders: { not: false }, nextInspection: { gte: now, lte: until } },
        { oilChangeReminders: { not: false }, nextOilChangeDate: { gte: now, lte: until } },
      ],
    },
    include: { owner: true },
  });

  const result: ReminderRunResult = { due: vehicles.length, sent: 0, skipped: 0, failed: 0, details: [] };

  for (const v of vehicles) {
    const owner = v.owner;
    if (!owner?.phone) {
      result.skipped++;
      result.details.push(`${v.plate}: cliente senza telefono`);
      continue;
    }
    if (owner.smsEnabled === false) {
      result.skipped++;
      result.details.push(`${v.plate}: notifiche disabilitate dal cliente`);
      continue;
    }

    const inspectionDue =
      !!v.nextInspection && v.nextInspection >= now && v.nextInspection <= until && v.inspectionReminders !== false;
    const oilDue =
      !!v.nextOilChangeDate && v.nextOilChangeDate >= now && v.nextOilChangeDate <= until && v.oilChangeReminders !== false;

    if (!inspectionDue && !oilDue) {
      result.skipped++;
      continue;
    }

    const type = inspectionDue ? SMSType.INSPECTION_REMINDER : SMSType.OIL_CHANGE_REMINDER;

    // Dedup: già inviato lo stesso tipo a questo cliente di recente?
    const recent = await prisma.sMSMessage.findFirst({
      where: { customerId: owner.id, type, sentAt: { gte: dedupeSince } },
    });
    if (recent) {
      result.skipped++;
      result.details.push(`${v.plate}: promemoria già inviato di recente`);
      continue;
    }

    const dueDate = inspectionDue ? v.nextInspection! : v.nextOilChangeDate!;
    const cosa = inspectionDue ? "la revisione" : "il tagliando";
    const dateStr = dueDate.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
    const message =
      `Ciao ${owner.firstName}, ti ricordiamo che ${cosa} della tua ${v.brand} ${v.modelName} ` +
      `(targa ${v.plate}) è in scadenza il ${dateStr}. Contattaci per fissare un appuntamento. Grazie!`;

    const send = await sendWhatsApp(owner.phone, message);

    await prisma.sMSMessage.create({
      data: {
        phoneNumber: owner.phone,
        customerId: owner.id,
        message,
        type,
        provider: SMSProvider.TWILIO,
        status: send.success ? SMSStatus.SENT : SMSStatus.FAILED,
        providerMessageId: send.messageId ?? null,
        sentAt: send.success ? new Date() : null,
        failedAt: send.success ? null : new Date(),
        errorMessage: send.error ?? null,
      },
    });

    if (send.success) {
      result.sent++;
    } else {
      result.failed++;
      result.details.push(`${v.plate}: errore invio (${send.error ?? "sconosciuto"})`);
    }
  }

  return result;
}
