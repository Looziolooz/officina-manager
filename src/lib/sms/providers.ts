import { Vonage } from "@vonage/server-sdk";
import { Twilio } from "twilio";

// Interfaccia per il risultato dell'invio
export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Interfaccia generica per i provider
export interface SMSProvider {
  send(to: string, message: string): Promise<SMSResult>;
}

// --- IMPLEMENTAZIONE TWILIO ---
export class TwilioProvider implements SMSProvider {
  private client: Twilio;
  private from: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
    const authToken = process.env.TWILIO_AUTH_TOKEN || "";
    this.from = process.env.TWILIO_FROM_NUMBER || "";

    if (!accountSid || !authToken) {
      console.warn("Twilio credentials missing");
    }

    this.client = new Twilio(accountSid, authToken);
  }

  async send(to: string, message: string): Promise<SMSResult> {
    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.from,
        to: to,
      });

      return { success: true, messageId: result.sid };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown Twilio error";
      console.error("Twilio Error:", errorMessage);
      return { success: false, error: errorMessage };
    }
  }
}

// --- IMPLEMENTAZIONE VONAGE ---
export class VonageProvider implements SMSProvider {
  private vonage: Vonage;

  constructor() {
    this.vonage = new Vonage({
      apiKey: process.env.VONAGE_API_KEY || "",
      apiSecret: process.env.VONAGE_API_SECRET || ""
    });
  }

  async send(to: string, message: string): Promise<SMSResult> {
    try {
      const from = "Officina";
      
      await this.vonage.sms.send({
        to,
        from,
        text: message
      });

      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown Vonage error";
      console.error("Vonage Error:", errorMessage);
      return { success: false, error: errorMessage };
    }
  }
}

// --- FACTORY ---
export function getSMSProvider(): SMSProvider {
  const provider = process.env.SMS_PROVIDER || "twilio";

  if (provider === "vonage") {
    return new VonageProvider();
  }
  
  return new TwilioProvider();
}