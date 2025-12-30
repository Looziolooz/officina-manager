"use server";

export async function sendWhatsAppNotification(phone: string, customerName: string, vehicle: string) {
  const message = `Ciao ${customerName}, sono Giovanni di GT Service. Ti avviso che la tua ${vehicle} è pronta per il ritiro! Ci trovi in officina fino alle 18:30.`;
  const encodedMessage = encodeURIComponent(message);
  
  // Pulizia numero di telefono (rimozione spazi o caratteri speciali)
  const cleanPhone = phone.replace(/\D/g, "");
  const finalPhone = cleanPhone.startsWith("39") ? cleanPhone : `39${cleanPhone}`;

  return `https://wa.me/${finalPhone}?text=${encodedMessage}`;
}