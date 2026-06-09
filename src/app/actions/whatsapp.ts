"use server";

import { prisma } from "@/lib/db";
import { sendWhatsApp } from "@/lib/whatsapp";
import { sendServiceReminders, type ReminderRunResult } from "@/lib/whatsapp-reminders";
import { requireSession } from "@/lib/auth-guards";
import { SMSType, SMSProvider, SMSStatus } from "@prisma/client";

export interface WhatsAppActionResult {
  success: boolean;
  message?: string;
}

// Invio manuale di un messaggio WhatsApp a un cliente (es. "auto pronta").
export async function sendWhatsAppManual(
  customerId: string,
  message: string,
  type: SMSType = SMSType.CUSTOM
): Promise<WhatsAppActionResult> {
  await requireSession();

  if (!message?.trim()) {
    return { success: false, message: "Il messaggio è vuoto." };
  }

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer?.phone) {
    return { success: false, message: "Cliente senza numero di telefono." };
  }

  const send = await sendWhatsApp(customer.phone, message);

  await prisma.sMSMessage.create({
    data: {
      phoneNumber: customer.phone,
      customerId,
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

  return send.success
    ? { success: true, message: "Messaggio WhatsApp inviato." }
    : { success: false, message: send.error || "Invio non riuscito." };
}

// Esecuzione manuale dei promemoria (per test/uso da pannello admin).
export async function runRemindersNow(withinDays = 7): Promise<ReminderRunResult> {
  await requireSession();
  return sendServiceReminders(withinDays);
}
