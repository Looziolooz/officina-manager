"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { smsProviderSchema, smsCampaignSchema } from "@/lib/schemas";
import type { SMSProviderFormData, SMSCampaignFormData } from "@/lib/schemas";

export async function upsertSMSProvider(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const result = smsProviderSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  const data = result.data;

  try {
    await prisma.sMSProviderConfig.upsert({
      where: { provider: data.provider },
      update: {
        isEnabled: data.isEnabled,
        priority: data.priority,
        name: data.name,
        dailyLimit: data.dailyLimit,
        costPerSMS: data.costPerSMS,
      },
      create: {
        provider: data.provider,
        isEnabled: data.isEnabled,
        priority: data.priority,
        name: data.name,
        dailyLimit: data.dailyLimit,
        costPerSMS: data.costPerSMS,
        remainingCredits: 0,
      },
    });
  } catch (error) {
    console.error("Errore configurazione provider SMS:", error);
    return { success: false, message: "Errore durante il salvataggio" };
  }

  revalidatePath("/admin/settings/sms");
  return { success: true };
}

export async function createSMSCampaign(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const result = smsCampaignSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  const data = result.data;

  try {
    // Get target customers
    let targetCustomerIds: string[] = [];
    
    if (data.targetAllCustomers) {
      const customers = await prisma.customer.findMany({
        where: { smsEnabled: true },
        select: { id: true },
      });
      targetCustomerIds = customers.map(c => c.id);
    } else {
      const where: any = { smsEnabled: true };
      if (data.targetMinTotalSpent) {
        where.totalSpent = { gte: data.targetMinTotalSpent };
      }
      if (data.targetVehicleFuelType) {
        where.vehicles = { some: { fuelType: data.targetVehicleFuelType } };
      }
      const customers = await prisma.customer.findMany({
        where,
        select: { id: true },
      });
      targetCustomerIds = customers.map(c => c.id);
    }

    await prisma.sMSCampaign.create({
      data: {
        name: data.name,
        message: data.message,
        scheduledFor: data.scheduledFor,
        status: "DRAFT",
        targetAllCustomers: data.targetAllCustomers,
        targetCustomerIds: targetCustomerIds.length > 0 ? JSON.stringify(targetCustomerIds) : undefined,
        targetMinTotalSpent: data.targetMinTotalSpent || undefined,
        targetVehicleFuelType: data.targetVehicleFuelType || undefined,
        createdById: "system", // TODO: get from session
      },
    });
  } catch (error) {
    console.error("Errore creazione campagna SMS:", error);
    return { success: false, message: "Errore durante il salvataggio" };
  }

  revalidatePath("/admin/marketing/sms");
  redirect("/admin/marketing/sms");
}

export async function updateCampaignStatus(campaignId: string, newStatus: string) {
  try {
    await prisma.sMSCampaign.update({
      where: { id: campaignId },
      data: { status: newStatus },
    });
    revalidatePath("/admin/marketing/sms");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Errore aggiornamento stato" };
  }
}

export async function deleteCampaign(campaignId: string) {
  try {
    await prisma.sMSCampaign.delete({
      where: { id: campaignId },
    });
    revalidatePath("/admin/marketing/sms");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Errore eliminazione" };
  }
}

// --- HELPERS ---

export async function getSMSProviders() {
  try {
    const providers = await prisma.sMSProviderConfig.findMany({
      orderBy: { priority: "asc" },
    });
    return providers;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getSMSCampaigns() {
  try {
    const campaigns = await prisma.sMSCampaign.findMany({
      include: {
        createdBy: { select: { name: true } },
      },
      orderBy: { scheduledFor: "desc" },
    });
    return campaigns;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getSMSMessages(status?: string) {
  try {
    const messages = await prisma.sMSMessage.findMany({
      where: status ? { status: status as any } : {},
      include: {
        customer: { select: { firstName: true, lastName: true } },
        vehicle: { select: { plate: true } },
        job: { select: { jobNumber: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return messages;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getCustomersForSMS() {
  try {
    const customers = await prisma.customer.findMany({
      where: { smsEnabled: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        totalSpent: true,
        vehicles: { select: { fuelType: true } },
      },
      orderBy: { lastName: "asc" },
    });
    return customers;
  } catch (error) {
    console.error(error);
    return [];
  }
}
