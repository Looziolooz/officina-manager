"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { 
  customerSchema, 
  type CustomerFormData,
  customerEditSchema,
  type CustomerEditData 
} from "@/lib/schemas";

// Funzione 1: Creazione Cliente + Veicolo (Transazione)
export async function createCustomerWithVehicle(data: CustomerFormData) {
  const validation = customerSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.flatten().fieldErrors };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email || null,
          phone: data.phone,
          alternatePhone: data.alternatePhone,
          address: data.address,
          technicalNotes: data.technicalNotes,
          familyNotes: data.familyNotes,
        },
      });

      await tx.vehicle.create({
        data: {
          plate: data.plate.toUpperCase().replace(/\s/g, ""),
          brand: data.brand,
          model: data.model,
          year: data.year,
          vin: data.vin,
          fuelType: data.fuelType,
          ownerId: customer.id,
        },
      });

      return customer;
    });

    revalidatePath("/admin/customers");
    return { success: true, customerId: result.id };

  } catch (error) {
    console.error("Errore DB:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes('plate')) return { success: false, error: "Questa TARGA esiste già nel sistema." };
        if (target.includes('email')) return { success: false, error: "Questa EMAIL è già associata a un altro cliente." };
        if (target.includes('phone')) return { success: false, error: "Questo TELEFONO è già registrato." };
      }
    }

    return { success: false, error: "Errore durante il salvataggio. Controlla che i dati non siano duplicati." };
  }
}

// Funzione 2: Aggiornamento Note (Tecniche / Ufficio)
export async function updateCustomerNotes(
  customerId: string,
  noteType: "technical" | "family",
  content: string
) {
  try {
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        [noteType === "technical" ? "technicalNotes" : "familyNotes"]: content,
      },
    });
    revalidatePath(`/admin/customers/${customerId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Errore aggiornamento note" };
  }
}

// Funzione 3: Aggiornamento Profilo Anagrafico
export async function updateCustomerProfile(customerId: string, data: CustomerEditData) {
  const validation = customerEditSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.flatten().fieldErrors };
  }

  try {
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone,
        alternatePhone: data.alternatePhone,
        address: data.address,
      },
    });

    revalidatePath(`/admin/customers/${customerId}`);
    return { success: true };
  } catch (error) {
    console.error("Errore aggiornamento:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
       // Gestione specifica duplicati durante l'edit
       return { success: false, error: "Email o Telefono già in uso da un altro cliente." };
    }
    
    return { success: false, error: "Errore durante l'aggiornamento." };
  }
}