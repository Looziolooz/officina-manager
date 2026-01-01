import twilio from 'twilio';

// Recupera le variabili o usa stringhe vuote per evitare 'undefined'
const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN || "";
const fromNumber = process.env.TWILIO_PHONE_NUMBER || "";

// Funzione per inizializzare il client in modo sicuro
// Evita il crash se le variabili d'ambiente non sono settate correttamente
const getTwilioClient = () => {
  // Il SID di Twilio DEVE iniziare con "AC"
  if (accountSid.startsWith("AC") && authToken.length > 0) {
    try {
      return twilio(accountSid, authToken);
    } catch (e) {
      console.warn("⚠️ Twilio Init Error:", e);
      return null;
    }
  }
  
  // Log silenzioso per non spammare la console in sviluppo se non si usa Twilio
  if (process.env.NODE_ENV === 'production') {
    console.warn("⚠️ Twilio non configurato: SID mancante o non valido.");
  }
  return null;
};

const client = getTwilioClient();

export async function sendWhatsAppNotification(to: string, customerName: string, plate: string) {
  // Se il client non è attivo, usciamo subito senza errori
  if (!client) {
    console.log("ℹ️ Notifica WhatsApp saltata (Twilio non configurato).");
    return { success: true, skipped: true };
  }

  // Pulizia del numero di telefono
  let cleanNumber = to.replace(/[\s-]/g, '');
  
  // Aggiunge prefisso internazionale se manca (default Italia +39)
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
  } catch (error) {
    console.error("❌ Errore invio WhatsApp:", error);
    // Ritorniamo false ma non lanciamo throw per non bloccare l'interfaccia utente
    return { success: false, error };
  }
}