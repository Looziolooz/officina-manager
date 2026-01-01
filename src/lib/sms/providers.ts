import twilio from "twilio";
import { Vonage } from "@vonage/server-sdk";
import messagebird from "messagebird";
import { prisma } from "@/lib/db";
import { SMSProvider, SMSType } from "@prisma/client";

// Interfaccia standard per il risultato dell'invio
export interface SMSResult {
  success: boolean;
  messageId?: string;
  cost?: number;
  error?: string;
  providerResponse?: unknown;
}

// Interfaccia per definire un Adapter
interface ProviderAdapter {
  name: string;
  send: (to: string, message: string) => Promise<SMSResult>;
}

// 1. TWILIO ADAPTER
const twilioAdapter: ProviderAdapter = {
  name: "TWILIO",
  async send(to: string, message: string): Promise<SMSResult> {
    try {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const res = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to,
      });
      return { success: true, messageId: res.sid, cost: 0.08, providerResponse: res };
    } catch (error) {
      const e = error as Error;
      return { success: false, error: e.message };
    }
  }
};

// 2. VONAGE ADAPTER
const vonageAdapter: ProviderAdapter = {
  name: "VONAGE",
  async send(to: string, message: string): Promise<SMSResult> {
    try {
      // @ts-expect-error - Vonage SDK types workaround
      const vonage = new Vonage({
        apiKey: process.env.VONAGE_API_KEY || "",
        apiSecret: process.env.VONAGE_API_SECRET || ""
      });
      
      const from = process.env.VONAGE_FROM_NUMBER || "GTService";
      const cleanTo = to.replace('+', '');
      
      const result = await vonage.sms.send({ to: cleanTo, from, text: message });
      
      // Vonage ritorna un array di messaggi
      const msg = result.messages[0];

      if (msg.status === "0") {
        return { 
          success: true, 
          messageId: msg["message-id"], 
          cost: parseFloat(msg["remaining-balance"] || "0.06"), 
          providerResponse: result 
        };
      }
      // Accesso sicuro alla proprietà error-text
      // @ts-expect-error - error-text esiste nella risposta raw ma i tipi potrebbero mancare
      return { success: false, error: msg["error-text"] || "Vonage Error" };
    } catch (error) {
      const e = error as Error;
      return { success: false, error: e.message };
    }
  }
};

// 3. MESSAGEBIRD ADAPTER
const messagebirdAdapter: ProviderAdapter = {
  name: "MESSAGEBIRD",
  async send(to: string, message: string): Promise<SMSResult> {
    try {
      const mb = messagebird(process.env.MESSAGEBIRD_API_KEY || "");
      
      return new Promise((resolve) => {
        mb.messages.create({
          originator: process.env.MESSAGEBIRD_FROM_NUMBER || "GTService",
          recipients: [to],
          body: message
        }, (err, response) => {
          if (err) {
            let errorMsg = "MessageBird Error";
            if (err instanceof Error) {
              errorMsg = err.message;
            } else if (typeof err === 'object' && err !== null && 'errors' in err) {
              // @ts-expect-error - Gestione errori specifica API
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              errorMsg = (err as any).errors.map((e: any) => e.description).join(", ");
            }
            resolve({ success: false, error: errorMsg });
          } else {
            resolve({ 
              success: true, 
              messageId: response.id, 
              cost: 0.07, 
              providerResponse: response 
            });
          }
        });
      });
    } catch (error) {
      const e = error as Error;
      return { success: false, error: e.message };
    }
  }
};

const providers = [twilioAdapter, vonageAdapter, messagebirdAdapter];

// --- FUNZIONE PRINCIPALE ---
export async function sendSMSWithFallback(
  to: string, 
  message: string, 
  type: SMSType
): Promise<{ success: boolean; provider?: string; error?: string; messageId?: string }> {
  
  let cleanTo = to.replace(/\s+/g, '');
  if (!cleanTo.startsWith('+')) cleanTo = '+39' + cleanTo;

  for (const provider of providers) {
    console.log(`[SMS] Tentativo invio con ${provider.name} a ${cleanTo}`);
    
    const result = await provider.send(cleanTo, message);

    if (result.success) {
      // FIX: Prisma model name case sensitive. Controlla il tuo schema.prisma.
      // Se nel file schema il modello è "SMSMessage", Prisma client lo mappa come "sMSMessage" (camelCase standard)
      await prisma.sMSMessage.create({
        data: {
          phoneNumber: cleanTo,
          message,
          type,
          provider: provider.name as SMSProvider,
          status: "SENT",
          providerMessageId: result.messageId,
          cost: result.cost,
          sentAt: new Date(),
          attempts: 1
        }
      });
      
      return { success: true, provider: provider.name, messageId: result.messageId };
    } else {
      console.warn(`[SMS] ❌ Fallito con ${provider.name}: ${result.error}`);
    }
  }

  // Fallimento totale
  await prisma.sMSMessage.create({
    data: {
      phoneNumber: cleanTo,
      message,
      type,
      provider: "MANUAL", 
      status: "FAILED",
      errorMessage: "Tutti i provider hanno fallito",
      failedAt: new Date(),
      attempts: providers.length
    }
  });

  return { success: false, error: "Tutti i provider SMS hanno fallito" };
}