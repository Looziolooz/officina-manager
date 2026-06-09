"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-guards";

// --- ACTIONS ---

export async function markAlertAsRead(alertId: string) {
  const session = await requireSession();
  try {
    await prisma.stockAlert.update({
      where: { id: alertId },
      data: {
        isRead: true,
        readAt: new Date(),
        readById: session.user.id,
      },
    });
    revalidatePath("/admin/inventory/alerts");
    return { success: true };
  } catch (error) {
    console.error("Errore aggiornamento alert:", error);
    return { success: false, message: "Errore durante l'aggiornamento" };
  }
}

export async function markAllAlertsAsRead() {
  const session = await requireSession();
  try {
    await prisma.stockAlert.updateMany({
      where: { isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
        readById: session.user.id,
      },
    });
    revalidatePath("/admin/inventory/alerts");
    return { success: true };
  } catch (error) {
    console.error("Errore aggiornamento alert:", error);
    return { success: false, message: "Errore durante l'aggiornamento" };
  }
}

export async function deleteAlert(alertId: string) {
  try {
    await prisma.stockAlert.delete({
      where: { id: alertId },
    });
    revalidatePath("/admin/warehouse/alerts");
    return { success: true };
  } catch (error) {
    console.error("Errore eliminazione alert:", error);
    return { success: false, message: "Errore durante l'eliminazione" };
  }
}

// --- HELPERS ---

export async function getStockAlerts(unreadOnly?: boolean) {
  await requireSession();
  try {
    const alerts = await prisma.stockAlert.findMany({
      where: unreadOnly ? { isRead: false } : {},
      include: {
        part: { select: { name: true, code: true, stock: true, minStock: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return alerts;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getUnreadAlertsCount() {
  await requireSession();
  try {
    const count = await prisma.stockAlert.count({
      where: { isRead: false },
    });
    return count;
  } catch (error) {
    console.error(error);
    return 0;
  }
}

export async function createStockAlertsForLowStock() {
  await requireSession();
  try {
    // Find parts with low stock
    const lowStockParts = await prisma.part.findMany({
      where: {
        stock: { lte: prisma.part.fields.minStock },
        stockLevel: { in: ["CRITICAL", "LOW"] },
      },
    });

    for (const part of lowStockParts) {
      // Check if alert already exists
      const existingAlert = await prisma.stockAlert.findFirst({
        where: {
          partId: part.id,
          isRead: false,
        },
      });

      if (!existingAlert) {
        const severity = part.stockLevel === "CRITICAL" ? "CRITICAL" : "WARNING";
        const message = part.stockLevel === "CRITICAL" 
          ? `Scorta critica per ${part.name}: rimasti solo ${part.stock} pezzi`
          : `Scorta bassa per ${part.name}: ${part.stock} pezzi rimasti (min: ${part.minStock})`;

        await prisma.stockAlert.create({
          data: {
            partId: part.id,
            alertType: part.stockLevel === "CRITICAL" ? "CRITICAL_STOCK" : "LOW_STOCK",
            message,
            severity,
          },
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Errore creazione alert:", error);
    return { success: false, message: "Errore durante la verifica" };
  }
}
