"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { QuoteStatus, MaintenanceType } from "@prisma/client";
import { quoteSchema, quoteItemSchema } from "@/lib/schemas";

// --- ACTIONS ---

export async function createQuote(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  
  // Parse items from formData (items are sent as JSON string)
  let items: any[] = [];
  if (rawData.items && typeof rawData.items === 'string') {
    try {
      items = JSON.parse(rawData.items);
    } catch {
      items = [];
    }
  }

  const result = quoteSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  const data = result.data;

  try {
    // Generate quote number
    const count = await prisma.quote.count();
    const quoteNumber = `QUO-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, "0")}`;

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;

    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        year: new Date().getFullYear(),
        number: count + 1,
        customerId: data.customerId,
        vehicleId: data.vehicleId,
        km: data.km || undefined,
        workDescription: data.workDescription || undefined,
        laborHours: data.laborHours || 0,
        laborRate: data.laborRate || 45,
        status: QuoteStatus.DRAFT,
        validUntil: data.validUntil,
        subtotal: 0,
        taxRate: 22,
        taxAmount: 0,
        total: 0,
        createdById: "system", // TODO: get from session
      },
    });

    // Create quote items if any
    if (items.length > 0) {
      for (const item of items) {
        const itemResult = quoteItemSchema.safeParse(item);
        if (itemResult.success) {
          const itemData = itemResult.data;
          const itemSubtotal = itemData.quantity * itemData.unitPrice - (itemData.discount || 0);
          subtotal += itemSubtotal;

          await prisma.quoteItem.create({
            data: {
              quoteId: quote.id,
              partId: itemData.partId || undefined,
              description: itemData.description,
              isPartProvidedByCustomer: itemData.isPartProvidedByCustomer || false,
              quantity: itemData.quantity,
              unitPrice: itemData.unitPrice,
              discount: itemData.discount || 0,
              vatRate: itemData.vatRate || 22,
              subtotal: itemSubtotal,
            },
          });
        }
      }
    }

    // Add labor cost if any
    const laborCost = (data.laborHours || 0) * (data.laborRate || 45);
    subtotal += laborCost;

    // Calculate tax and total
    const tax = subtotal * 0.22;
    const total = subtotal + tax;

    // Update quote with totals
    await prisma.quote.update({
      where: { id: quote.id },
      data: {
        subtotal,
        taxAmount: tax,
        total,
      },
    });

  } catch (error) {
    console.error("Errore creazione preventivo:", error);
    return { success: false, message: "Errore durante la creazione del preventivo" };
  }

  revalidatePath("/admin/quotes");
  redirect("/admin/quotes");
}

export async function updateQuoteStatus(quoteId: string, newStatus: QuoteStatus) {
  try {
    await prisma.quote.update({
      where: { id: quoteId },
      data: { status: newStatus },
    });

    revalidatePath(`/admin/quotes/${quoteId}`);
    revalidatePath("/admin/quotes");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Errore aggiornamento stato preventivo" };
  }
}

export async function convertQuoteToJob(quoteId: string) {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { items: true, customer: true, vehicle: true },
    });

    if (!quote) {
      return { success: false, message: "Preventivo non trovato" };
    }

    if (quote.status !== "ACCEPTED") {
      return { success: false, message: "Il preventivo deve essere accettato prima di convertirlo" };
    }

    const result = await prisma.$transaction(async (tx) => {
      // Generate job number
      const count = await tx.job.count();
      const jobNumber = `JOB-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, "0")}`;

      // Create job
      const job = await tx.job.create({
        data: {
          jobNumber,
          title: `Lavoro da preventivo ${quote.quoteNumber}`,
          description: quote.workDescription || undefined,
          vehicleId: quote.vehicleId,
          customerId: quote.customerId,
          kmAtEntry: quote.km || 0,
          scheduledDate: new Date(),
          status: "SCHEDULED",
          laborHours: quote.laborHours || 0,
          laborRate: quote.laborRate || 45,
          laborCost: (quote.laborHours || 0) * (quote.laborRate || 45),
          maintenanceType: "OTHER",
        },
      });

      // Create parts from quote items
      for (const item of quote.items) {
        if (item.partId) {
          await tx.partOnJob.create({
            data: {
              jobId: job.id,
              partId: item.partId,
              quantity: item.quantity,
              appliedPrice: item.unitPrice,
              discount: item.discount || 0,
            },
          });

          // Update stock
          const part = await tx.part.findUnique({ where: { id: item.partId } });
          if (part && part.stock !== null && item.quantity !== null) {
            await tx.part.update({
              where: { id: item.partId },
              data: { stock: Math.max(0, part.stock - item.quantity) },
            });
          }
        }
      }

      // Update quote status and link
      await tx.quote.update({
        where: { id: quoteId },
        data: {
          status: QuoteStatus.CONVERTED,
          convertedJobId: job.id,
        },
      });

      return job;
    });

    revalidatePath("/admin/workshop");
    revalidatePath("/admin/quotes");
    redirect(`/admin/workshop/${result.id}`);
  } catch (error) {
    console.error("Errore conversione preventivo:", error);
    return { success: false, message: "Errore durante la conversione del preventivo" };
  }
}

export async function convertQuoteToInvoice(quoteId: string) {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { items: true },
    });

    if (!quote) {
      return { success: false, message: "Preventivo non trovato" };
    }

    const result = await prisma.$transaction(async (tx) => {
      // Generate invoice number
      const count = await tx.invoice.count();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, "0")}`;

      // Create invoice
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          year: new Date().getFullYear(),
          number: count + 1,
          customerId: quote.customerId,
          status: "DRAFT",
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          subtotal: quote.subtotal,
          taxRate: quote.taxRate,
          taxAmount: quote.taxAmount,
          total: quote.total,
          amountDue: quote.total,
        },
      });

      // Create invoice items from quote items
      for (const item of quote.items) {
        await tx.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            vatRate: item.vatRate,
            subtotal: item.subtotal,
          },
        });
      }

      // Update quote
      await tx.quote.update({
        where: { id: quoteId },
        data: {
          status: QuoteStatus.CONVERTED,
          convertedInvoiceId: invoice.id,
        },
      });

      return invoice;
    });

    revalidatePath("/admin/accounting/invoices");
    revalidatePath("/admin/quotes");
    redirect(`/admin/accounting/invoices/${result.id}`);
  } catch (error) {
    console.error("Errore conversione preventivo in fattura:", error);
    return { success: false, message: "Errore durante la conversione in fattura" };
  }
}

// --- HELPERS ---

export async function getQuotes(status?: QuoteStatus) {
  try {
    const quotes = await prisma.quote.findMany({
      where: status ? { status } : {},
      include: {
        customer: { select: { firstName: true, lastName: true } },
        vehicle: { select: { plate: true, brand: true, modelName: true } },
        createdBy: { select: { name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return quotes;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getQuoteById(quoteId: string) {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        customer: true,
        vehicle: true,
        items: { include: { part: true } },
        createdBy: { select: { name: true } },
      },
    });
    return quote;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getCustomersForSelect() {
  try {
    const customers = await prisma.customer.findMany({
      select: { id: true, firstName: true, lastName: true, phone: true },
      orderBy: { lastName: "asc" },
    });
    return customers;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getVehiclesByCustomer(customerId: string) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { ownerId: customerId },
      select: { id: true, plate: true, brand: true, modelName: true },
      orderBy: { plate: "asc" },
    });
    return vehicles;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getPartsForSelect() {
  try {
    const parts = await prisma.part.findMany({
      select: { id: true, code: true, name: true, sellPrice: true, stock: true },
      where: { stock: { gt: 0 } },
      orderBy: { name: "asc" },
    });
    return parts;
  } catch (error) {
    console.error(error);
    return [];
  }
}
