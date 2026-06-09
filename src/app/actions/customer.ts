"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth-guards";
// FIX: Importiamo gli schemi da lib/schemas per evitare duplicazioni ed errori di tipo
import { customerWithVehicleSchema, customerEditSchema } from "@/lib/schemas"; 

// --- ACTIONS ---

// 1. CREAZIONE CLIENTE + VEICOLO
export async function createCustomerWithVehicle(formData: FormData) {
  await requireSession();
  const rawData = Object.fromEntries(formData.entries());
  
  // Usiamo lo schema centralizzato che include già technicalNotes, familyNotes e i campi veicolo
  const result = customerWithVehicleSchema.safeParse(rawData);

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
            brand: data.brand || "",
            modelName: data.model || "",
            year: data.year || new Date().getFullYear(),
            vin: data.vin,
            fuelType: data.fuelType,
            engineSize: data.engineSize?.toString(),
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
  data: { technicalNotes?: string; familyNotes?: string }
) {
  await requireSession();
  try {
    await prisma.customer.update({
      where: { id: customerId },
      data,
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
  await requireSession();
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