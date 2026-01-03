import twilio from 'twilio';

// Recupera le variabili o usa stringhe vuote per evitare 'undefined'
const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN || "";
const fromNumber = process.env.TWILIO_PHONE_NUMBER || "";

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
  
  if (process.env.NODE_ENV === 'production') {
    console.warn("⚠️ Twilio non configurato: SID mancante o non valido.");
  }
  return null;
};

const client = getTwilioClient();

export async function sendWhatsAppNotification(to: string, customerName: string, plate: string) {
  if (!client) {
    console.log("ℹ️ Notifica WhatsApp saltata (Twilio non configurato).");
    return { success: true, skipped: true };
  }

  let cleanNumber = to.replace(/[\s-]/g, '');
  if (!cleanNumber.startsWith('+')) {
    cleanNumber = `+39${cleanNumber}`;
  }

  const formattedTo = `whatsapp:${cleanNumber}`;
  const messageBody = `Ciao ${customerName}, la tua auto targata ${plate} è pronta per il ritiro presso la nostra officina! 🚗🔧`;

  try {
    const message = await client.messages.create({
      body: messageBody,
      from: fromNumber,
      to: formattedTo
    });
    console.log("✅ WhatsApp inviato:", message.sid);
    return { success: true, sid: message.sid };
  } catch (error: unknown) {
    // FIX: Gestione corretta del tipo 'unknown' nel catch block
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Errore invio WhatsApp:", errorMessage);
    return { success: false, error: errorMessage };
  }
}