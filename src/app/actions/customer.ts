"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- SCHEMI DI VALIDAZIONE ---

// Schema per la creazione completa (Cliente + Veicolo)
const customerCreateSchema = z.object({
  firstName: z.string().min(2, "Nome richiesto"),
  lastName: z.string().min(2, "Cognome richiesto"),
  phone: z.string().min(6, "Telefono richiesto"),
  email: z.string().email("Email non valida").optional().or(z.literal("")),
  alternatePhone: z.string().optional(),
  address: z.string().optional(),
  
  // Dati Fiscali
  companyName: z.string().optional(),
  vatNumber: z.string().optional(),
  fiscalCode: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  province: z.string().optional(),
  pec: z.string().optional(),
  sdiCode: z.string().optional(),

  // Note
  technicalNotes: z.string().optional(),
  familyNotes: z.string().optional(),

  // Veicolo
  plate: z.string().min(4, "Targa richiesta").toUpperCase(),
  brand: z.string().min(2, "Marca richiesta"),
  model: z.string().min(2, "Modello richiesto"),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  vin: z.string().optional(),
  fuelType: z.string().optional(),
  engineSize: z.string().optional(),
});

// Schema per l'aggiornamento del solo profilo cliente
const customerUpdateSchema = z.object({
  firstName: z.string().min(2, "Nome richiesto"),
  lastName: z.string().min(2, "Cognome richiesto"),
  phone: z.string().min(6, "Telefono richiesto"),
  email: z.string().email("Email non valida").optional().or(z.literal("")),
  alternatePhone: z.string().optional(),
  address: z.string().optional(),
  
  companyName: z.string().optional(),
  vatNumber: z.string().optional(),
  fiscalCode: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  province: z.string().optional(),
  pec: z.string().optional(),
  sdiCode: z.string().optional(),
});


// --- ACTIONS ---

// 1. CREAZIONE CLIENTE + VEICOLO (Rinominata come richiesto dalla UI)
export async function createCustomerWithVehicle(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const result = customerCreateSchema.safeParse(rawData);

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

// 2. AGGIORNAMENTO NOTE (Richiesto da NoteEditor.tsx)
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

// 3. AGGIORNAMENTO PROFILO (Richiesto da EditCustomerForm.tsx)
export async function updateCustomerProfile(customerId: string, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const result = customerUpdateSchema.safeParse(rawData);

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