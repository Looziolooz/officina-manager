import twilio from "twilio";

// Recupera le variabili o usa stringhe vuote per evitare 'undefined'
const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN || "";

// Funzione per inizializzare il client in modo sicuro
const getTwilioClient = () => {
  if (accountSid.startsWith("AC") && authToken.length > 0) {
    try {
      return twilio(accountSid, authToken);
    } catch (e) {
      console.warn("⚠️ Twilio Init Error:", e);
      return null;
    }
  }

  if (process.env.NODE_ENV === "production") {
    console.warn("⚠️ Twilio non configurato: SID mancante o non valido.");
  }
  return null;
};

const client = getTwilioClient();

export interface WhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
}

// Numero mittente WhatsApp. In dev: sandbox Twilio "whatsapp:+14155238886"
// (il cliente deve prima iscriversi inviando "join <parola>"). In produzione:
// il numero WhatsApp Business approvato (TWILIO_WHATSAPP_FROM).
function getWhatsAppFrom(): string {
  const from =
    process.env.TWILIO_WHATSAPP_FROM ||
    process.env.TWILIO_FROM_NUMBER ||
    "whatsapp:+14155238886";
  return from.startsWith("whatsapp:") ? from : `whatsapp:${from}`;
}

// Normalizza il numero destinatario: pulisce spazi, aggiunge +39 se manca il
// prefisso internazionale, poi antepone "whatsapp:".
function toWhatsAppAddress(to: string): string {
  let n = to.replace(/[\s-]/g, "");
  if (n.startsWith("whatsapp:")) return n;
  if (!n.startsWith("+")) n = `+39${n.replace(/^0+/, "")}`;
  return `whatsapp:${n}`;
}

// Invio WhatsApp generico tramite Twilio. Riusato da promemoria e notifiche.
export async function sendWhatsApp(to: string, message: string): Promise<WhatsAppResult> {
  if (!client) {
    console.log("ℹ️ Invio WhatsApp saltato (Twilio non configurato).");
    return { success: false, skipped: true, error: "Twilio non configurato." };
  }
  if (!to?.trim()) {
    return { success: false, error: "Numero destinatario mancante." };
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: getWhatsAppFrom(),
      to: toWhatsAppAddress(to),
    });
    return { success: true, messageId: result.sid };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Errore invio WhatsApp:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Notifica "auto pronta per il ritiro" (manteniamo la firma esistente).
export async function sendWhatsAppNotification(to: string, customerName: string, plate: string) {
  const body = `Ciao ${customerName}, la tua auto targata ${plate} è pronta per il ritiro presso la nostra officina! 🚗🔧`;
  return sendWhatsApp(to, body);
}
