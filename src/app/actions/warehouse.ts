"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { StockLevel, MovementType, Prisma } from "@prisma/client";
import { partSchema, MovementFormData, PartFormData } from "@/lib/schemas";
import { requireRole, requireSession } from "@/lib/auth-guards";
import { Role } from "@prisma/client";

// --- HELPERS ---

function calculateStockLevel(stock: number, minStock: number): StockLevel {
  if (stock === 0) return 'CRITICAL';
  if (stock < minStock * 0.3) return 'CRITICAL';
  if (stock < minStock) return 'LOW';
  if (stock > minStock * 3) return 'HIGH';
  return 'NORMAL';
}

// --- ACTIONS ---

export async function createPart(data: PartFormData) {
  await requireRole([Role.ADMIN, Role.MANAGER]);
  const validation = partSchema.safeParse(data);
  if (!validation.success) return { success: false, error: validation.error.flatten().fieldErrors };

  try {
    const part = await prisma.part.create({
      data: {
        ...data,
        stockLevel: calculateStockLevel(data.stock ?? 0, data.minStock),
      }
    });
    revalidatePath('/admin/inventory');
    return { success: true, part };
  } catch (error) {
    console.error("Errore creazione parte:", error);
    return { success: false, error: "Codice ricambio già esistente o errore DB" };
  }
}

export async function createStockMovement(data: MovementFormData) {
  const session = await requireSession();
  const performedById = session.user.id;

  return await prisma.$transaction(async (tx) => {
    // 1. Recupera ricambio
    const part = await tx.part.findUnique({ where: { id: data.partId } });
    if (!part) throw new Error("Ricambio non trovato");

    // 2. Calcola delta stock
    // Se è OUT o RETURN, la quantità è negativa
    const multiplier = (data.type === 'OUT' || data.type === 'RETURN') ? -1 : 1;
    const stockChange = data.quantity * multiplier;
    const stockAfter = (part.stock ?? 0) + stockChange;

    // 3. Controllo giacenza negativa
    if (stockAfter < 0) {
      throw new Error(`Stock insufficiente. Disponibili: ${part.stock} pz`);
    }

    // 4. Genera numero movimento
    const year = new Date().getFullYear();
    const count = await tx.stockMovement.count({ where: { createdAt: { gte: new Date(year, 0, 1) } } });
    const movementNumber = `MOV-${year}-${String(count + 1).padStart(4, '0')}`;

    // 5. Crea Movimento
    const totalValue = Math.abs(stockChange) * (part.buyPrice ?? 0);

    await tx.stockMovement.create({
      data: {
        movementNumber,
        type: data.type as MovementType,
        partId: data.partId,
        quantity: stockChange,
        stockBefore: part.stock ?? 0,
        stockAfter,
        unitPrice: part.buyPrice ?? 0,
        totalValue,
        documentNumber: data.documentNumber,
        notes: data.notes,
        reason: data.reason,
        performedById
      }
    });

    // 6. Aggiorna Ricambio
    const newStockLevel = calculateStockLevel(stockAfter, part.minStock ?? 0);
    
    // FIX: Sostituito 'any' con il tipo corretto di Prisma
    const updateData: Prisma.PartUpdateInput = {
      stock: stockAfter,
      totalValue: stockAfter * (part.buyPrice ?? 0),
      stockLevel: newStockLevel,
    };

    if (data.type === 'IN') {
      updateData.lastPurchaseDate = new Date();
    }

    await tx.part.update({
      where: { id: data.partId },
      data: updateData
    });

    // 7. Gestione Alert
    if (stockAfter < (part.minStock ?? 0)) {
      const isCritical = stockAfter === 0 || stockAfter < (part.minStock ?? 0) * 0.3;
      await tx.stockAlert.create({
        data: {
          part: { connect: { id: data.partId } }, // Sintassi corretta per le relazioni
          alertType: stockAfter === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
          severity: isCritical ? 'CRITICAL' : 'WARNING',
          message: stockAfter === 0 
            ? `ESAURITO: ${part.name} (${part.code})` 
            : `SCORTA BASSA: ${part.name}. Rimasti ${stockAfter}/${part.minStock}`
        }
      });
    }

    return { success: true };
  }).catch(err => {
    console.error(err);
    return { success: false, error: err.message };
  });
}