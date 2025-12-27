// 

import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { NextResponse } from "next/server";

// Inizializza Resend (se manca la key, userà i log per testare)
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

export async function GET() {
  try {
    const today = new Date();
    let emailsSent = 0;

    // --- 1. DEFINIZIONE FINESTRE TEMPORALI ---
    
    // Obiettivo TAGLIANDO: Auto che hanno fatto l'ultimo cambio olio circa 11 mesi fa
    const targetOilDate = new Date();
    targetOilDate.setMonth(today.getMonth() - 11);
    const windowStartOil = new Date(targetOilDate.getTime() - 30 * 24 * 60 * 60 * 1000); // Finestra di 30gg

    // Obiettivo REVISIONE: Auto che hanno fatto l'ultima revisione circa 23 mesi fa
    const targetRevDate = new Date();
    targetRevDate.setMonth(today.getMonth() - 23);
    const windowStartRev = new Date(targetRevDate.getTime() - 30 * 24 * 60 * 60 * 1000); // Finestra di 30gg

    console.log(`🤖 CRON STARTED. Searching for vehicles...`);

    // --- 2. QUERY INTELLIGENTE ---
    const vehiclesToNotify = await prisma.vehicle.findMany({
      where: {
        AND: [
          {
            OR: [
              // A. Scadenza Tagliando (tra 11 e 12 mesi dall'ultimo)
              {
                lastOilChange: {
                  lte: targetOilDate,
                  gte: windowStartOil
                }
              },
              // B. Scadenza Revisione (tra 23 e 24 mesi dall'ultima)
              {
                lastRevisionDate: {
                  lte: targetRevDate,
                  gte: windowStartRev
                }
              }
            ]
          },
          // C. ESCLUSIONE: Non disturbare chi ha già lavori recenti o programmati!
          {
            jobs: {
              none: {
                OR: [
                  { status: "SCHEDULATO" },      // Ha già un appuntamento
                  { status: "IN_LAVORAZIONE" },  // È già in officina
                  // Ha finito un lavoro negli ultimi 30 giorni (magari ha appena fatto il tagliando ma non abbiamo aggiornato la data)
                  { 
                    status: "COMPLETATO",
                    endDate: { gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) }
                  }
                ]
              }
            }
          }
        ]
      },
      include: {
        customer: true
      }
    });

    // --- 3. INVIO EMAIL ---
    for (const vehicle of vehiclesToNotify) {
      // Salta chi non ha email valida
      if (!vehicle.customer.email || vehicle.customer.email.includes("no-mail") || !vehicle.customer.consentMarketing) {
        console.log(`⏩ Skipped ${vehicle.plate}: No valid email or no consent`);
        continue;
      }

      // Determina il tipo di scadenza predominante
      const isRevisione = vehicle.lastRevisionDate && 
                          vehicle.lastRevisionDate <= targetRevDate && 
                          vehicle.lastRevisionDate >= windowStartRev;

      const tipoScadenza = isRevisione ? "Revisione Biennale" : "Tagliando Annuale";
      const emailSubject = `⚠️ Scadenza ${tipoScadenza} - ${vehicle.plate}`;
      
      const emailBody = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">OfficinaPro Reminder</h2>
          <p>Ciao <strong>${vehicle.customer.firstName}</strong>,</p>
          <p>Dai nostri registri risulta che la tua <strong>${vehicle.model}</strong> (Targa: ${vehicle.plate}) ha la <strong>${tipoScadenza}</strong> in scadenza il prossimo mese.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;">📅 Consigliamo di prenotare entro: <strong>${new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('it-IT')}</strong></p>
          </div>

          <p>Per viaggiare in sicurezza, prenota subito un appuntamento.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/contatti" 
               style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Prenota Appuntamento
            </a>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin-top: 40px;" />
          <p style="font-size: 12px; color: #666; text-align: center;">
            OfficinaPro - Via dei Meccanici 12, Milano<br/>
            Se hai già provveduto, ignora questa email.
          </p>
        </div>
      `;

      if (resend) {
        await resend.emails.send({
          from: 'OfficinaPro <reminders@tuodominio.com>', // Aggiorna con il tuo dominio verificato su Resend
          to: vehicle.customer.email,
          subject: emailSubject,
          html: emailBody,
        });
        console.log(`✅ EMAIL SENT via Resend to ${vehicle.customer.email}`);
      } else {
        console.log(`[SIMULAZIONE] 📧 Email a ${vehicle.customer.email} per ${vehicle.plate}`);
      }
      
      emailsSent++;
    }

    return NextResponse.json({ 
      success: true, 
      processed: vehiclesToNotify.length, 
      sent: emailsSent 
    });

  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ success: false, error: "Errore interno server" }, { status: 500 });
  }
}