"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deliverySchema } from "@/lib/schemas";
import type { DeliveryFormData } from "@/lib/schemas";

export async function createDelivery(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const result = deliverySchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  const data = result.data;

  try {
    await prisma.supplierDelivery.create({
      data: {
        supplierName: data.supplierName,
        documentNumber: data.documentNumber,
        listNumber: data.listNumber || undefined,
        deliveryDate: data.deliveryDate,
        totalAmount: data.totalAmount,
        taxAmount: data.taxAmount,
        notes: data.notes || undefined,
        pdfUrl: data.pdfUrl || undefined,
        importedById: "system", // TODO: get from session
      },
    });
  } catch (error) {
    console.error("Errore creazione consegna:", error);
    return { success: false, message: "Errore durante il salvataggio della consegna" };
  }

  revalidatePath("/admin/inventory/deliveries");
  redirect("/admin/inventory/deliveries");
}

export async function deleteDelivery(deliveryId: string) {
  try {
    await prisma.supplierDelivery.delete({
      where: { id: deliveryId },
    });
    revalidatePath("/admin/inventory/deliveries");
    return { success: true };
  } catch (error) {
    console.error("Errore eliminazione consegna:", error);
    return { success: false, message: "Errore durante l'eliminazione" };
  }
}

// --- HELPERS ---

export async function getDeliveries() {
  try {
    const deliveries = await prisma.supplierDelivery.findMany({
      include: {
        importedBy: { select: { name: true } },
      },
      orderBy: { deliveryDate: "desc" },
    });
    return deliveries;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getDeliveryById(deliveryId: string) {
  try {
    const delivery = await prisma.supplierDelivery.findUnique({
      where: { id: deliveryId },
      include: {
        importedBy: { select: { name: true } },
      },
    });
    return delivery;
  } catch (error) {
    console.error(error);
    return null;
  }
}
