"use server";

import { revalidatePath } from "next/cache";
import { generalSettingsSchema } from "@/lib/schemas";
import type { GeneralSettingsData } from "@/lib/schemas";

export async function updateGeneralSettings(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const result = generalSettingsSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  const data = result.data;

  try {
    // In a real app, you'd save to a settings table or config file
    // For now, we'll use environment variables or a simple key-value store
    // This is a placeholder for the actual implementation
    console.log("Updating general settings:", data);
    
    // You could save to database, file, or update .env
    // await saveSettingsToDB(data);
  } catch (error) {
    console.error("Errore salvataggio impostazioni:", error);
    return { success: false, message: "Errore durante il salvataggio" };
  }

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function updateSMSTemplates(formData: FormData) {
  try {
    const templates = {
      oilChangeReminder: formData.get("oilChangeReminder") as string,
      inspectionReminder: formData.get("inspectionReminder") as string,
      carReady: formData.get("carReady") as string,
      appointmentConfirm: formData.get("appointmentConfirm") as string,
      quoteReady: formData.get("quoteReady") as string,
      paymentReminder: formData.get("paymentReminder") as string,
    };

    // Save templates to DB or config
    console.log("Updating SMS templates:", templates);
    
    revalidatePath("/admin/settings/sms");
    return { success: true };
  } catch (error) {
    console.error("Errore salvataggio template:", error);
    return { success: false, message: "Errore durante il salvataggio" };
  }
}

// --- HELPERS ---

export async function getGeneralSettings() {
  // In a real app, fetch from DB or config
  // This is a placeholder
  return {
    companyName: process.env.COMPANY_NAME || "Officina Manager",
    companyAddress: process.env.COMPANY_ADDRESS || "",
    companyPhone: process.env.COMPANY_PHONE || "",
    companyEmail: process.env.COMPANY_EMAIL || "",
    vatNumber: process.env.VAT_NUMBER || "",
    fiscalCode: process.env.FISCAL_CODE || "",
    logoUrl: process.env.LOGO_URL || "",
  };
}

export async function getSMSTemplates() {
  // Placeholder for SMS templates
  return {
    oilChangeReminder: "Ciao {nome}, è tempo per il cambio olio della tua {marca} {modello} (targa {targa}). Contattaci per prenotare!",
    inspectionReminder: "Ciao {nome}, la revisione della tua {marca} {modello} (targa {targa}) scade a breve. Chiama per appuntamento!",
    carReady: "Ciao {nome}, la tua auto {marca} {modello} è pronta! Puoi passare a ritirarla quando vuoi.",
    appointmentConfirm: "Ciao {nome}, confermiamo il tuo appuntamento per il {data} alle ore {ora}. Grazie!",
    quoteReady: "Ciao {nome}, il preventivo per la tua {marca} {modello} è pronto. Consultalo al link: {link}",
    paymentReminder: "Ciao {nome}, ti ricordiamo che hai un pagamento in sospeso di € {importo}. Grazie!",
  };
}
