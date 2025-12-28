"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Assicurarsi che sia presente 'export'
export async function getParts() {
  try {
    const parts = await prisma.part.findMany({
      orderBy: { name: 'asc' },
    });
    return { success: true, data: parts };
  } catch (error) {
    console.error("Errore nel recupero magazzino:", error); 
    return { success: false, error: "Errore nel recupero dati" };
  }
}

export async function addPart(formData: FormData) {
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const quantity = parseInt(formData.get("quantity") as string) || 0;
  const price = parseFloat(formData.get("price") as string) || 0;

  try {
    await prisma.part.create({
      data: {
        name,
        code,
        stockQuantity: quantity,
        sellPrice: price,
        buyPrice: price * 0.6,
        minThreshold: 5
      },
    });
    revalidatePath("/admin/magazzino");
    return { success: true };
  } catch (error) {
    console.error("Errore aggiunta pezzo:", error);
    return { success: false, error: "Errore durante il salvataggio" };
  }
}

export async function deletePart(id: string) {
  try {
    await prisma.part.delete({ where: { id } });
    revalidatePath("/admin/magazzino");
    return { success: true };
  } catch (error) {
    console.error("Errore eliminazione:", error);
    return { success: false };
  }
}