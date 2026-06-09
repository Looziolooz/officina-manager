"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { PaymentMethod, ExpenseCategory } from "@prisma/client";
import { InvoiceFormData, ExpenseFormData } from "@/lib/schemas";
import { addDays } from "date-fns";
import { requireRole } from "@/lib/auth-guards";
import { Role } from "@prisma/client";

// --- FATTURAZIONE DA LAVORO (JOB) ---

export async function createInvoiceFromJob(jobId: string) {
  await requireRole([Role.ADMIN, Role.MANAGER]);
  return await prisma.$transaction(async (tx) => {
    // 1. Recupera Job
    const job = await tx.job.findUnique({
      where: { id: jobId },
      include: { 
        vehicle: { include: { owner: true } },
        parts: { include: { part: true } }
      }
    });

    if (!job || !job.vehicle.owner) throw new Error("Dati mancanti");
    
    // 2. Genera Numero Fattura Progressivo Anno Corrente
    const year = new Date().getFullYear();
    const lastInvoice = await tx.invoice.findFirst({
      where: { year },
      orderBy: { number: 'desc' }
    });
    const nextNum = (lastInvoice?.number || 0) + 1;
    const invoiceNumber = `FT-${year}-${String(nextNum).padStart(3, '0')}`;

  // 3. Prepara Righe
    const laborItem = {
      description: `Manodopera: ${job.title}`,
      quantity: job.laborHours ?? 1,
      unitPrice: job.laborRate ?? 45,
      discount: 0,
      vatRate: 22, // La manodopera ha IVA standard 22%
      subtotal: job.laborCost ?? 0,
    };

    const partsItems = job.parts.map(p => {
      const appliedPrice = p.appliedPrice ?? 0;
      const quantity = p.quantity ?? 1;
      const discount = p.discount ?? 0;
      const vatRate = 22; // Default 22% per i ricambi
      const subtotal = appliedPrice * quantity * (1 - discount / 100);
      return {
        description: p.part.name,
        quantity,
        unitPrice: appliedPrice,
        discount,
        vatRate,
        subtotal,
      };
    });

    const items = [laborItem, ...partsItems];

    // 4. Calcoli - IVA dinamica per riga
    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    const taxAmount = items.reduce((acc, item) => acc + (item.subtotal * (item.vatRate / 100)), 0);
    const total = subtotal + taxAmount;

    // 5. Crea Fattura
    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        year,
        number: nextNum,
        status: 'ISSUED',
        issueDate: new Date(),
        dueDate: addDays(new Date(), 30), // Scadenza default 30gg
        customerId: job.vehicle.owner.id,
        jobId: job.id,
        subtotal,
        taxAmount,
        total,
        amountDue: total,
        items: { create: items }
      }
    });

    // 6. Crea Movimento Contabile (Competenza)
    await tx.accountingRecord.create({
      data: {
        recordNumber: `REG-${year}-${String(nextNum).padStart(4, '0')}`,
        type: 'INCOME',
        date: new Date(),
        amount: subtotal,
        totalAmount: total,
        category: 'Officina',
        description: `Fattura ${invoiceNumber} - ${job.vehicle.plate}`,
        invoiceId: invoice.id
      }
    });

    revalidatePath('/admin/accounting');
    return { success: true, invoiceId: invoice.id };
  });
}

// --- FATTURAZIONE MANUALE (NUOVA FUNZIONE) ---

export async function createManualInvoice(data: any) {
  await requireRole([Role.ADMIN, Role.MANAGER]);
  return await prisma.$transaction(async (tx) => {
    // 1. Genera Numero Fattura
    const year = new Date().getFullYear();
    const lastInvoice = await tx.invoice.findFirst({
      where: { year },
      orderBy: { number: 'desc' }
    });
    const nextNum = (lastInvoice?.number || 0) + 1;
    const invoiceNumber = `FT-${year}-${String(nextNum).padStart(3, '0')}`; 
    
    // 2. Calcola Totali - IVA dinamica per riga
    const items = (data.items || []) as Array<{ description: string; quantity?: number; unitPrice?: number; discount?: number; vatRate?: number }>;
    const itemsWithTotals = items.map(item => {
      const quantity = item.quantity ?? 1;
      const unitPrice = item.unitPrice ?? 0;
      const discount = item.discount ?? 0;
      const vatRate = item.vatRate ?? 22;
      const subtotal = quantity * unitPrice * (1 - discount / 100);
      return { ...item, quantity, unitPrice, discount, vatRate, subtotal };
    });

    const subtotal = itemsWithTotals.reduce((acc, item) => acc + item.subtotal, 0);
    const taxAmount = itemsWithTotals.reduce((acc, item) => acc + (item.subtotal * (item.vatRate / 100)), 0);
    const total = subtotal + taxAmount;

    // 3. Crea Fattura
    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        year,
        number: nextNum,
        status: 'ISSUED',
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        customerId: data.customerId,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        subtotal,
        taxRate: 22, // Media ponderata non necessaria per ora
        taxAmount,
        total,
        amountDue: total,
        items: {
          create: itemsWithTotals.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            vatRate: item.vatRate,
            subtotal: item.subtotal
          }))
        }
      }
    });

    // 4. Crea Movimento Contabile
    await tx.accountingRecord.create({
      data: {
        recordNumber: `REG-${year}-${String(nextNum).padStart(4, '0')}`,
        type: 'INCOME',
        date: data.issueDate,
        amount: subtotal,
        totalAmount: total,
        category: 'Vendita',
        description: `Fattura Manuale ${invoiceNumber}`,
        invoiceId: invoice.id
      }
    });

    revalidatePath('/admin/accounting');
    return { success: true, invoiceId: invoice.id };
  });
}

// --- REGISTRAZIONE PAGAMENTO ---

export async function registerPayment(invoiceId: string, amount: number, method: PaymentMethod) {
  await requireRole([Role.ADMIN, Role.MANAGER]);
  return await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new Error("Fattura non trovata");

    const newPaid = (invoice.amountPaid ?? 0) + amount;
    const newDue = (invoice.total ?? 0) - newPaid;
    const status = newDue <= 0.01 ? 'PAID' : 'PARTIALLY_PAID';

    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: newPaid,
        amountDue: newDue,
        status,
        paymentMethod: method,
        paidDate: status === 'PAID' ? new Date() : null
      }
    });

    revalidatePath('/admin/accounting');
    return { success: true };
  });
}

// --- SPESE ---

export async function createExpense(data: ExpenseFormData) {
  await requireRole([Role.ADMIN, Role.MANAGER]);
  try {
    const expense = await prisma.expense.create({
      data: {
        category: data.category as ExpenseCategory,
        description: data.description,
        amount: data.amount,
        taxAmount: data.taxAmount,
        totalAmount: data.amount + data.taxAmount,
        expenseDate: data.expenseDate,
        isPaid: data.isPaid,
        supplierName: data.supplierName ?? "",
      }
    });
    
    // Se pagata, registra in contabilità
    if (data.isPaid) {
       await prisma.accountingRecord.create({
         data: {
           recordNumber: `SPE-${Date.now()}`,
           type: 'EXPENSE',
           date: data.expenseDate,
           amount: data.amount,
           totalAmount: data.amount + data.taxAmount,
           category: data.category,
           description: data.description,
           expenseId: expense.id
         }
       });
    }

    revalidatePath('/admin/accounting');
    return { success: true };
  } catch (e) {
    // FIX: Ora usiamo 'e' per loggare l'errore, risolvendo il warning ESLint
    console.error("Errore creazione spesa:", e);
    return { success: false, error: "Errore creazione spesa" };
  }
}