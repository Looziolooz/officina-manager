"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole, requireSession } from "@/lib/auth-guards";
import { MovementType, Role } from "@prisma/client";

// --- SCHEMAS ---

const partSchema = z.object({
  code: z.string().min(3, "Codice richiesto"),
  name: z.string().min(3, "Nome richiesto"),
  category: z.string(),
  brand: z.string().optional(),
  buyPrice: z.coerce.number().min(0),
  sellPrice: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  minStock: z.coerce.number().int().min(0),
  location: z.string().optional(),
  supplierCode: z.string().optional(),
});

const stockMovementSchema = z.object({
  partId: z.string(),
  quantity: z.coerce.number().int(), 
  type: z.enum(["IN", "OUT", "ADJUSTMENT", "RETURN", "TRANSFER"]),
  reason: z.string().optional(),
  jobId: z.string().optional(),
});

const addPartToJobSchema = z.object({
  jobId: z.string(),
  partId: z.string(),
  quantity: z.coerce.number().int().min(1),
});

// --- CORE ACTIONS ---

// 1. CREA NUOVO RICAMBIO
export async function createPart(formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER]);
  const rawData = Object.fromEntries(formData.entries());
  const result = partSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  const data = result.data;

  try {
    const markup = data.buyPrice > 0 
      ? ((data.sellPrice - data.buyPrice) / data.buyPrice) * 100 
      : 0;

    await prisma.part.create({
      data: {
        ...data,
        markup,
        totalValue: data.stock * data.buyPrice,
      },
    });
  } catch (error) {
    console.error(error);
    return { success: false, message: "Errore: Codice ricambio già esistente?" };
  }

  revalidatePath("/admin/inventory");
  redirect("/admin/inventory");
}

// 2. MOVIMENTAZIONE STOCK
export async function updateStock(formData: FormData) {
  const session = await requireSession();

  const rawData = Object.fromEntries(formData.entries());
  const result = stockMovementSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, error: "Dati non validi" };
  }

  const { partId, quantity, type, reason, jobId } = result.data;

  try {
    await prisma.$transaction(async (tx) => {
      const part = await tx.part.findUnique({ where: { id: partId } });
      if (!part) throw new Error("Ricambio non trovato");

      const newStock = (part.stock ?? 0) + quantity;
      if (newStock < 0) throw new Error("Giacenza insufficiente");

       // 1. Crea movimento
       await tx.stockMovement.create({
          data: {
            movementNumber: `MOV-${Date.now()}`,
            type: type as MovementType,
            partId,
            quantity: Math.abs(quantity),
            stockBefore: part.stock ?? 0,
            stockAfter: newStock,
           performedById: session.user.id,
           jobId: jobId || null,
           reason,
            unitPrice: part.buyPrice ?? 0,
            totalValue: Math.abs(quantity) * (part.buyPrice ?? 0),
         },
       });

      // 2. Aggiorna Part
      await tx.part.update({
        where: { id: partId },
        data: {
           stock: newStock,
           totalValue: newStock * (part.buyPrice ?? 0),
           stockLevel: newStock <= (part.minStock ?? 0) ? "LOW" : "NORMAL",
        },
      });
    });
  } catch (error) {
    console.error(error);
    return { success: false, message: "Errore movimento magazzino" };
  }

  revalidatePath("/admin/inventory");
  return { success: true };
}

// 3. AGGIUNGI RICAMBIO A UN LAVORO
export async function addPartToJob(formData: FormData) {
  await requireSession();
  const rawData = Object.fromEntries(formData.entries());
  const result = addPartToJobSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, message: "Dati mancanti" };
  }

  const { jobId, partId, quantity } = result.data;

  try {
    await prisma.$transaction(async (tx) => {
      const part = await tx.part.findUniqueOrThrow({ where: { id: partId } });

      if ((part.stock ?? 0) < quantity) {
        throw new Error(`Disponibilità insufficiente. Rimasti: ${part.stock ?? 0}`);
      }

      const existingLink = await tx.partOnJob.findUnique({
        where: { jobId_partId: { jobId, partId } }
      });

      if (existingLink) {
        await tx.partOnJob.update({
          where: { id: existingLink.id },
          data: { 
            quantity: { increment: quantity }
          }
        });
      } else {
        await tx.partOnJob.create({
          data: {
            jobId,
            partId,
            quantity,
            appliedPrice: part.sellPrice ?? 0,
            discount: 0
          }
        });
      }

      const newStock = (part.stock ?? 0) - quantity;
      await tx.part.update({
        where: { id: partId },
        data: { 
          stock: newStock,
          totalValue: newStock * (part.buyPrice ?? 0)
        }
      });
    });

  } catch (error) {
    console.error(error);
    return { success: false, message: "Errore durante l'aggiunta del ricambio." };
  }

  revalidatePath(`/admin/workshop/${jobId}`);
  return { success: true };
}

// --- DASHBOARD QUICK ACTIONS (RIPRISTINATE PER FIX BUILD) ---

export async function getQuickPartsStock() {
  await requireSession();
  try {
    // Recupera ricambi comuni per la dashboard (es. Olio, Filtri) o quelli con stock basso
    const parts = await prisma.part.findMany({
        where: {
          OR: [
            { category: { contains: "Olio" } },
            { category: { contains: "Filtri" } },
            { stockLevel: "LOW" }
          ],
        },
      take: 10,
      orderBy: { stock: "asc" }
    });
    return { success: true, data: parts };
  } catch (error) {
    console.error("Quick stock fetch error:", error);
    return { success: false, data: [] };
  }
}

export async function decrementPartStockAction(partId: string) {
  const session = await requireSession();
  const performedById = session.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      const part = await tx.part.findUnique({ where: { id: partId } });
      if (!part) throw new Error("Not found");

      if ((part.stock ?? 0) < 1) throw new Error("No stock");

      const newStock = (part.stock ?? 0) - 1;

      // Crea movimento rapido
      await tx.stockMovement.create({
        data: {
           movementNumber: `QCK-${Date.now()}`,
           type: "OUT",
           partId,
           quantity: 1,
           stockBefore: part.stock ?? 0,
           stockAfter: newStock,
           reason: "Quick Dashboard Use",
           unitPrice: part.buyPrice ?? 0,
           totalValue: part.buyPrice ?? 0,
          performedById
        }
      });

      await tx.part.update({
        where: { id: partId },
        data: { stock: newStock }
      });
    });
    
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}