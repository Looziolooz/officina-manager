// src/app/actions/inventory.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. LEGGI
export async function getParts() {
  try {
    const parts = await prisma.part.findMany({
      orderBy: { name: 'asc' },
    });
    return { success: true, data: parts };
  } catch (error) {
    // FIX: Ora usiamo la variabile error loggandola
    console.error("Errore nel recupero magazzino:", error); 
    return { success: false, error: "Errore nel recupero dati" };
  }
}

// 2. SCRIVI
export async function addPart(formData: FormData) {
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const price = parseFloat(formData.get("price") as string);
  const minThreshold = parseInt(formData.get("minThreshold") as string) || 5;

  if (!name || !code) return { success: false, error: "Dati mancanti" };

  try {
    await prisma.part.create({
      data: {
        name,
        code,
        stockQuantity: quantity,
        sellPrice: price,
        buyPrice: price * 0.6,
        minThreshold
      },
    });

    revalidatePath("/admin/magazzino"); 
    return { success: true };
  } catch (error) {
    // FIX: Logghiamo l'errore specifico
    console.error("Errore aggiunta pezzo:", error);
    return { success: false, error: "Codice articolo già esistente o errore DB" };
  }
}

// 3. ELIMINA
export async function deletePart(id: string) {
  try {
    await prisma.part.delete({ where: { id } });
    revalidatePath("/admin/magazzino");
    return { success: true };
  } catch (error) {
    // FIX: Logghiamo l'errore
    console.error("Errore eliminazione pezzo:", error);
    return { success: false, error: "Impossibile eliminare" };
  }
}