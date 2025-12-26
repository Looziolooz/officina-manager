import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { NextResponse } from "next/server";

// Inizializza Resend (se manca la key, userà i log)
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

export async function GET() {
  try {
    const today = new Date();
    let emailsSent = 0;

    // --- LOGICA DATE ---
    
    // 1. Obiettivo TAGLIANDO: Auto che hanno fatto l'ultimo cambio olio circa 11 mesi fa
    const targetOilDate = new Date();
    targetOilDate.setMonth(today.getMonth() - 11);
    
    // Finestra Tagliando: cerchiamo da 11 mesi fa fino a 10 mesi fa (arco di 30gg)
    // Così prendiamo tutte le auto che stanno per scadere nel prossimo mese
    const windowStartOil = new Date(targetOilDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 2. Obiettivo REVISIONE: Auto che hanno fatto l'ultima revisione circa 23 mesi fa
    const targetRevDate = new Date();
    targetRevDate.setMonth(today.getMonth() - 23);
    const windowStartRev = new Date(targetRevDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    console.log(`🤖 CRON STARTED. Searching for:`);
    console.log(`   - Oil changes between ${windowStartOil.toLocaleDateString()} and ${targetOilDate.toLocaleDateString()}`);
    console.log(`   - Revisions between ${windowStartRev.toLocaleDateString()} and ${targetRevDate.toLocaleDateString()}`);

    // --- QUERY ---
    const vehiclesToNotify = await prisma.vehicle.findMany({
      where: {
        OR: [
          // A. Scadenza Tagliando
          {
            lastOilChange: {
              lte: targetOilDate,   // Più vecchio di 11 mesi fa
              gte: windowStartOil   // Ma non più vecchio di 12 mesi (evitiamo spam a chi è scaduto da tempo)
            }
          },
          // B. Scadenza Revisione
          {
            lastRevisionDate: {
              lte: targetRevDate,
              gte: windowStartRev
            }
          }
        ]
      },
      include: {
        customer: true
      }
    });

    // --- INVIO EMAIL ---
    for (const vehicle of vehiclesToNotify) {
      // Salta chi non ha email o ha mail fittizia
      if (!vehicle.customer.email || vehicle.customer.email.includes("no-mail")) {
        console.log(`⏩ Skipped ${vehicle.plate}: No valid email`);
        continue;
      }

      // Determina il tipo di avviso
      // Se lastRevisionDate rientra nella finestra targetRevDate, allora è una revisione
      const isRevisione = vehicle.lastRevisionDate && 
                          vehicle.lastRevisionDate <= targetRevDate && 
                          vehicle.lastRevisionDate >= windowStartRev;

      const tipoScadenza = isRevisione ? "Revisione Biennale" : "Tagliando Annuale";
      
      const emailSubject = `⚠️ Scadenza ${tipoScadenza} - ${vehicle.plate}`;
      
      // Template HTML Semplice
      const emailBody = `
        <div style="font-family: sans-serif; color: #333;">
          <h1>Ciao ${vehicle.customer.firstName},</h1>
          <p>Ti ricordiamo che la tua <strong>${vehicle.model}</strong> (Targa: <strong>${vehicle.plate}</strong>) ha la <strong>${tipoScadenza}</strong> in scadenza il prossimo mese.</p>
          <p>Per viaggiare in sicurezza ed evitare sanzioni, ti consigliamo di prenotare un appuntamento.</p>
          <br />
          <a href="http://localhost:3000/contatti" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Prenota Ora
          </a>
          <br /><br />
          <p style="font-size: 12px; color: #666;">
            A presto,<br/>
            Lo Staff di OfficinaPro
          </p>
        </div>
      `;

      if (resend) {
        await resend.emails.send({
          from: 'OfficinaPro <onboarding@resend.dev>', // Sender di test
          to: vehicle.customer.email,
          subject: emailSubject,
          html: emailBody,
        });
        console.log(`✅ EMAIL SENT via Resend to ${vehicle.customer.email} (${vehicle.plate})`);
      } else {
        console.log(`[SIMULAZIONE] 📧 Email a ${vehicle.customer.email}: "${emailSubject}"`);
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
    return NextResponse.json({ success: false, error: "Errore interno" }, { status: 500 });
  }
}