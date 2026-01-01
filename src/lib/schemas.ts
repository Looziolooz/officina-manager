import { z } from "zod";
// FIX: Aggiunti gli Enum mancanti
import { MovementType, PaymentMethod, ExpenseCategory } from "@prisma/client";

// --- WAREHOUSE SCHEMAS ---

export const partSchema = z.object({
  code: z.string().min(3, "Codice troppo corto"),
  name: z.string().min(3, "Nome obbligatorio"),
  category: z.string().min(1, "Categoria obbligatoria"),
  brand: z.string().optional(),
  location: z.string().optional(),
  buyPrice: z.coerce.number().min(0),
  markup: z.coerce.number().min(0),
  minStock: z.coerce.number().min(0),
  maxStock: z.coerce.number().optional(),
});

export const movementSchema = z.object({
  partId: z.string(),
  type: z.nativeEnum(MovementType),
  quantity: z.coerce.number().positive("La quantità deve essere positiva"),
  documentNumber: z.string().optional(),
  notes: z.string().optional(),
  reason: z.string().optional(),
});

export type PartFormData = z.infer<typeof partSchema>;
export type MovementFormData = z.infer<typeof movementSchema>;

// --- CUSTOMER SCHEMAS ---

// Schema base per la creazione (Cliente + Veicolo)
export const customerSchema = z.object({
  firstName: z.string().min(2, "Nome richiesto"),
  lastName: z.string().min(2, "Cognome richiesto"),
  email: z.string().email("Email non valida").optional().or(z.literal("")),
  phone: z.string().min(6, "Telefono richiesto"),
  alternatePhone: z.string().optional(),
  address: z.string().optional(),
  
  // Dati Veicolo Iniziale
  plate: z.string().min(4, "Targa richiesta").toUpperCase(),
  brand: z.string().min(2, "Marca richiesta"),
  model: z.string().min(1, "Modello richiesto"),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  vin: z.string().optional(),
  fuelType: z.string().optional(),
  engineSize: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

// Schema per la modifica del SOLO cliente
export const customerEditSchema = z.object({
  firstName: z.string().min(2, "Nome richiesto"),
  lastName: z.string().min(2, "Cognome richiesto"),
  email: z.string().email("Email non valida").optional().or(z.literal("")),
  phone: z.string().min(6, "Telefono richiesto"),
  alternatePhone: z.string().optional(),
  address: z.string().optional(),
  technicalNotes: z.string().optional(),
  familyNotes: z.string().optional(),
});



export type CustomerEditData = z.infer<typeof customerEditSchema>;

// --- ACCOUNTING SCHEMAS ---

export const invoiceSchema = z.object({
  customerId: z.string().min(1, "Seleziona un cliente"),
  issueDate: z.date(),
  dueDate: z.date(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().min(0.01),
    unitPrice: z.number().min(0),
    discount: z.number().default(0),
    vatRate: z.number().default(22),
  })).min(1, "Inserisci almeno una riga"),
});

export const expenseSchema = z.object({
  description: z.string().min(3, "Descrizione richiesta"),
  amount: z.coerce.number().min(0, "Importo richiesto"),
  taxAmount: z.coerce.number().default(0),
  category: z.nativeEnum(ExpenseCategory),
  expenseDate: z.date(),
  supplierName: z.string().min(2, "Fornitore richiesto"),
  isPaid: z.boolean().default(false),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type ExpenseFormData = z.infer<typeof expenseSchema>;