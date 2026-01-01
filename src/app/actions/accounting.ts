"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {  PaymentMethod } from "@prisma/client";
import { InvoiceFormData, ExpenseFormData } from "@/lib/schemas";
import { addDays } from "date-fns";

// --- FATTURAZIONE DA LAVORO (JOB) ---

export async function createInvoiceFromJob(jobId: string) {
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
    const items = [
      {
        description: `Manodopera: ${job.title}`,
        quantity: job.laborHours,
        unitPrice: job.laborRate,
        discount: 0,
        subtotal: job.laborCost,
        vatRate: 22
      },
      ...job.parts.map(p => ({
        description: p.part.name,
        quantity: p.quantity,
        unitPrice: p.appliedPrice,
        discount: p.discount,
        subtotal: p.appliedPrice * p.quantity * (1 - p.discount/100),
        vatRate: 22
      }))
    ];

    // 4. Calcoli
    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    const taxAmount = subtotal * 0.22;
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

export async function createManualInvoice(data: InvoiceFormData) {
  return await prisma.$transaction(async (tx) => {
    // 1. Genera Numero Fattura
    const year = new Date().getFullYear();
    const lastInvoice = await tx.invoice.findFirst({
      where: { year },
      orderBy: { number: 'desc' }
    });
    const nextNum = (lastInvoice?.number || 0) + 1;
    const invoiceNumber = `FT-${year}-${String(nextNum).padStart(3, '0')}`; 

    // 2. Calcola Totali
    const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice * (1 - item.discount / 100)), 0);
    
    // Per semplicità qui applichiamo il 22% sul totale imponibile
    const taxRate = 22; 
    const taxAmount = subtotal * (taxRate / 100);
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
        taxRate,
        taxAmount,
        total,
        amountDue: total, // Si assume non pagata alla creazione
        items: {
          create: data.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            vatRate: item.vatRate,
            subtotal: item.quantity * item.unitPrice * (1 - item.discount / 100)
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
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) throw new Error("Fattura non trovata");

  const newPaid = invoice.amountPaid + amount;
  const newDue = invoice.total - newPaid;
  const status = newDue <= 0.01 ? 'PAID' : 'PARTIALLY_PAID';

  await prisma.invoice.update({
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
}

// --- SPESE ---

export async function createExpense(data: ExpenseFormData) {
  try {
    const expense = await prisma.expense.create({
      data: {
        category: data.category,
        description: data.description,
        amount: data.amount,
        taxAmount: data.taxAmount,
        totalAmount: data.amount + data.taxAmount,
        expenseDate: data.expenseDate,
        isPaid: data.isPaid,
        supplierName: data.supplierName
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