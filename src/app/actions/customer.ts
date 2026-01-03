"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
// FIX: Importiamo gli schemi da lib/schemas per evitare duplicazioni ed errori di tipo
import { customerSchema, customerEditSchema } from "@/lib/schemas"; 

// --- ACTIONS ---

// 1. CREAZIONE CLIENTE + VEICOLO
export async function createCustomerWithVehicle(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  
  // Usiamo lo schema centralizzato che include già technicalNotes e familyNotes
  const result = customerSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      error: result.error.flatten().fieldErrors,
    };
  }

  const data = result.data;

  try {
    const existingCustomer = await prisma.customer.findFirst({ where: { phone: data.phone } });
    if (existingCustomer) return { success: false, message: "Telefono già registrato." };

    const existingCar = await prisma.vehicle.findUnique({ where: { plate: data.plate } });
    if (existingCar) return { success: false, message: "Targa già registrata." };

    await prisma.customer.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email || null,
        alternatePhone: data.alternatePhone,
        address: data.address,
        companyName: data.companyName,
        vatNumber: data.vatNumber,
        fiscalCode: data.fiscalCode,
        city: data.city,
        postalCode: data.postalCode,
        province: data.province,
        pec: data.pec,
        sdiCode: data.sdiCode,
        // Ora questi campi sono riconosciuti perché presenti in customerSchema
        technicalNotes: data.technicalNotes, 
        familyNotes: data.familyNotes,
        vehicles: {
          create: {
            plate: data.plate,
            brand: data.brand,
            model: data.model,
            year: data.year,
            vin: data.vin,
            fuelType: data.fuelType,
            engineSize: data.engineSize,
          },
        },
      },
    });
  } catch (error) {
    console.error(error);
    return { success: false, message: "Errore database." };
  }

  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

// 2. AGGIORNAMENTO NOTE
export async function updateCustomerNotes(
  customerId: string, 
  technicalNotes: string, 
  familyNotes: string
) {
  try {
    await prisma.customer.update({
      where: { id: customerId },
      data: { technicalNotes, familyNotes },
    });
    revalidatePath(`/admin/customers/${customerId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Errore salvataggio note" };
  }
}

// 3. AGGIORNAMENTO PROFILO
export async function updateCustomerProfile(customerId: string, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  // Usiamo lo schema di edit centralizzato
  const result = customerEditSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  const data = result.data;

  try {
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email || null,
        alternatePhone: data.alternatePhone,
        address: data.address,
        companyName: data.companyName,
        vatNumber: data.vatNumber,
        fiscalCode: data.fiscalCode,
        city: data.city,
        postalCode: data.postalCode,
        province: data.province,
        pec: data.pec,
        sdiCode: data.sdiCode,
      },
    });
  } catch (error) {
    console.error(error);
    return { success: false, message: "Errore aggiornamento profilo" };
  }

  revalidatePath(`/admin/customers/${customerId}`);
  redirect(`/admin/customers/${customerId}`);
}