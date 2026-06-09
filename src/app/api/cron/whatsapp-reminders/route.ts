import { NextRequest, NextResponse } from "next/server";
import { sendServiceReminders } from "@/lib/whatsapp-reminders";

// Endpoint cron: invia i promemoria WhatsApp di tagliando/revisione in scadenza.
// Protetto da CRON_SECRET. Chiamalo una volta al giorno da uno scheduler, es:
//   curl -H "Authorization: Bearer $CRON_SECRET" https://tuo-dominio/api/cron/whatsapp-reminders
// oppure: https://tuo-dominio/api/cron/whatsapp-reminders?secret=...
export const dynamic = "force-dynamic";

async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET non configurato sul server." }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization") || "";
  const bearer = authHeader.replace(/^Bearer\s+/i, "");
  const provided = bearer || req.nextUrl.searchParams.get("secret") || "";

  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const withinDays = Number(req.nextUrl.searchParams.get("days")) || 7;

  try {
    const result = await sendServiceReminders(withinDays);
    return NextResponse.json({ success: true, withinDays, ...result });
  } catch (error) {
    console.error("[cron/whatsapp-reminders] errore:", error);
    return NextResponse.json({ success: false, error: "Esecuzione promemoria fallita." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
