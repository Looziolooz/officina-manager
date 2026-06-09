"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { wasteSchema } from "@/lib/schemas";
import type { WasteFormData } from "@/lib/schemas";

export async function createWasteRecord(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const result = wasteSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  const data = result.data;

  try {
    await prisma.wasteRecord.create({
      data: {
        type: data.type,
        quantity: data.quantity,
        unit: data.unit,
        movementType: data.movementType,
        date: data.date,
        documentNumber: data.documentNumber || undefined,
        carrierName: data.carrierName || undefined,
        notes: data.notes || undefined,
        recordedById: "system", // TODO: get from session
      },
    });
  } catch (error) {
    console.error("Errore creazione registro rifiuti:", error);
    return { success: false, message: "Errore durante il salvataggio" };
  }

  revalidatePath("/admin/warehouse/waste");
  redirect("/admin/warehouse/waste");
}

export async function deleteWasteRecord(wasteId: string) {
  try {
    await prisma.wasteRecord.delete({
      where: { id: wasteId },
    });
    revalidatePath("/admin/warehouse/waste");
    return { success: true };
  } catch (error) {
    console.error("Errore eliminazione:", error);
    return { success: false, message: "Errore durante l'eliminazione" };
  }
}

// --- HELPERS ---

export async function getWasteRecords() {
  try {
    const records = await prisma.wasteRecord.findMany({
      include: {
        recordedBy: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    });
    return records;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getWasteStats() {
  try {
    const records = await prisma.wasteRecord.groupBy({
      by: ["type", "unit"],
      _sum: {
        quantity: true,
      },
    });
    return records;
  } catch (error) {
    console.error(error);
    return [];
  }
}
