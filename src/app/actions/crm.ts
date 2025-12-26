"use server";

import { prisma } from "@/lib/prisma";

// 1. Recupera Clienti e calcola scadenze
export async function getCustomersWithStatus() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        vehicles: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { firstName: 'asc' }
    });
    return { success: true, data: customers };
  } catch (error) {
    // FIX: Ora usiamo la variabile error loggandola
    console.error("Errore recupero clienti:", error);
    return { success: false, data: [] };
  }
}

// 2. Simula invio SMS/Email
export async function sendReminder(customerId: string, vehiclePlate: string, type: 'TAGLIANDO' | 'REVISIONE') {
  // Qui in produzione useremmo Twilio o SendGrid.
  // In dev, simuliamo un ritardo di rete.
  
  await new Promise(resolve => setTimeout(resolve, 1500)); // Aspetta 1.5 secondi

  // Log per simulare l'invio
  console.log(`>>> MOCK SMS INVIATO A CLIENTE ${customerId}`);
  console.log(`>>> Messaggio: Ciao! La tua auto ${vehiclePlate} deve fare la ${type}. Prenota ora!`);

  return { success: true, message: "Promemoria inviato con successo!" };
}