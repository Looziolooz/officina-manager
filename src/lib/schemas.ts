import { z } from "zod";
import { AppointmentType, AppointmentStatus, QuoteStatus, Role, SMSProvider, SMSType } from "@prisma/client";

// --- USER SCHEMAS ---
export const createUserSchema = z.object({
  email: z.string().email("Email non valida"),
  name: z.string().min(2, "Nome richiesto"),
  password: z.string().min(8, "Password minimo 8 caratteri"),
  role: z.nativeEnum(Role).default("VIEWER"),
  isActive: z.coerce.boolean().default(true),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  id: z.string(),
  email: z.string().email("Email non valida"),
  name: z.string().min(2, "Nome richiesto"),
  role: z.nativeEnum(Role),
  isActive: z.coerce.boolean(),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export const changePasswordSchema = z.object({
  userId: z.string(),
  newPassword: z.string().min(8, "Password minimo 8 caratteri"),
});

// --- CUSTOMER SCHEMAS ---
export const customerSchema = z.object({
  firstName: z.string().min(2, "Nome richiesto"),
  lastName: z.string().min(2, "Cognome richiesto"),
  email: z.string().email("Email non valida").optional().or(z.literal("")),
  phone: z.string().min(10, "Telefono richiesto"),
  address: z.string().optional(),
  companyName: z.string().optional(),
  vatNumber: z.string().optional(),
  fiscalCode: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  province: z.string().optional(),
  country: z.string().default("IT"),
  pec: z.string().optional(),
  sdiCode: z.string().optional(),
  technicalNotes: z.string().optional(),
  familyNotes: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

// --- CUSTOMER + VEHICLE SCHEMA (for createCustomerWithVehicle action) ---
export const customerWithVehicleSchema = customerSchema.extend({
  plate: z.string().min(5, "Targa richiesta"),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce.number().default(new Date().getFullYear()),
  vin: z.string().optional(),
  fuelType: z.string().optional(),
  engineSize: z.string().optional(),
  alternatePhone: z.string().optional(),
});

export type CustomerWithVehicleFormData = z.infer<typeof customerWithVehicleSchema>;

// --- CUSTOMER EDIT SCHEMA ---
export const customerEditSchema = customerSchema.extend({
  alternatePhone: z.string().optional(),
});

// Note: customerEditSchema inherits all fields from customerSchema including 'country'

export type CustomerEditFormData = z.infer<typeof customerEditSchema>;

// --- MOVEMENT SCHEMA ---
export const movementSchema = z.object({
  partId: z.string().min(1, "Ricambio richiesto"),
  quantity: z.coerce.number().min(0.01, "Quantità > 0"),
  type: z.string().min(1, "Tipo richiesto"),
  reason: z.string().optional(),
  jobId: z.string().optional(),
  documentNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type MovementFormData = z.infer<typeof movementSchema>;

// --- APPOINTMENT SCHEMAS (FASE 1) ---
export const appointmentSchema = z.object({
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  type: z.nativeEnum(AppointmentType).default("SCHEDULED_WORK"),
  notes: z.string().optional(),
  customerId: z.string().optional(),
  vehicleId: z.string().optional(),
  walkInName: z.string().optional(),
  walkInPhone: z.string().optional(),
  walkInPlate: z.string().optional(),
}).refine(
  (d) => d.customerId || (d.walkInName && d.walkInPhone),
  { message: "Inserire cliente esistente o dati walk-in", path: ["customerId"] }
);

export type AppointmentFormData = z.infer<typeof appointmentSchema>;

// --- QUOTE ITEM SCHEMA ---
export const quoteItemSchema = z.object({
  partId: z.string().optional(),
  description: z.string().min(1, "Descrizione richiesta"),
  isPartProvidedByCustomer: z.boolean().default(false),
  quantity: z.coerce.number().min(0.01, "Quantità > 0"),
  unitPrice: z.coerce.number().min(0, "Prezzo ≥ 0"),
  discount: z.coerce.number().default(0),
  vatRate: z.coerce.number().default(22),
});

export type QuoteItemFormData = z.infer<typeof quoteItemSchema>;

// --- QUOTE SCHEMAS (FASE 5) ---
export const quoteSchema = z.object({
  customerId: z.string().min(1, "Cliente richiesto"),
  vehicleId: z.string().min(1, "Veicolo richiesto"),
  km: z.coerce.number().optional(),
  workDescription: z.string().optional(),
  laborHours: z.coerce.number().default(0),
  laborRate: z.coerce.number().default(45),
  validUntil: z.coerce.date(),
  items: z.array(quoteItemSchema).min(1, "Almeno un articolo richiesto"),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;

// --- PART SCHEMA (for warehouse) ---
export const partSchema = z.object({
  code: z.string().min(3, "Codice richiesto"),
  name: z.string().min(3, "Nome richiesto"),
  category: z.string(),
  brand: z.string().optional(),
  buyPrice: z.coerce.number().min(0),
  sellPrice: z.coerce.number().min(0),
  markup: z.coerce.number().min(0).default(30),
  stock: z.coerce.number().int().min(0),
  minStock: z.coerce.number().int().min(0),
  maxStock: z.coerce.number().int().min(0).optional(),
  location: z.string().optional(),
  supplierCode: z.string().optional(),
});

export type PartFormData = z.infer<typeof partSchema>;

// --- INVOICE SCHEMA ---
export const invoiceSchema = z.object({
  customerId: z.string().min(1, "Cliente richiesto"),
  jobId: z.string().optional(),
  dueDate: z.coerce.date(),
  taxRate: z.coerce.number().default(22),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  paymentMethod: z.string().optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

// --- EXPENSE SCHEMA ---
export const expenseSchema = z.object({
  category: z.string().min(1, "La categoria è obbligatoria"),
  description: z.string().min(1, "La descrizione è obbligatoria"),
  amount: z.number().min(0.01, "L'importo deve essere maggiore di 0"),
  taxAmount: z.number().min(0, "L'imposta non può essere negativa"),
  expenseDate: z.date(),
  supplierName: z.string().optional(),
  paymentMethod: z.string().optional(),
  isPaid: z.boolean().default(false),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

// --- SMS SCHEMAS ---
export const smsProviderSchema = z.object({
  provider: z.nativeEnum(SMSProvider),
  isEnabled: z.coerce.boolean().default(true),
  priority: z.coerce.number().min(1).default(1),
  name: z.string().min(1, "Nome richiesto"),
  dailyLimit: z.coerce.number().min(0).default(100),
  costPerSMS: z.coerce.number().min(0).default(0.08),
});

export type SMSProviderFormData = z.infer<typeof smsProviderSchema>;

export const smsCampaignSchema = z.object({
  name: z.string().min(2, "Nome campagna richiesto"),
  message: z.string().min(10, "Messaggio troppo corto"),
  scheduledFor: z.coerce.date(),
  targetAllCustomers: z.coerce.boolean().default(false),
  targetMinTotalSpent: z.coerce.number().min(0).optional(),
  targetVehicleFuelType: z.string().optional(),
});

export type SMSCampaignFormData = z.infer<typeof smsCampaignSchema>;

// --- WASTE SCHEMA ---
export const wasteSchema = z.object({
  type: z.string().min(2, "Tipo rifiuto richiesto"),
  quantity: z.coerce.number().min(0.01, "Quantità > 0"),
  unit: z.string().default("kg"),
  movementType: z.string().default("OUT"),
  date: z.coerce.date(),
  documentNumber: z.string().optional(),
  carrierName: z.string().optional(),
  notes: z.string().optional(),
});

export type WasteFormData = z.infer<typeof wasteSchema>;

// --- SETTINGS SCHEMAS ---
export const generalSettingsSchema = z.object({
  companyName: z.string().min(1, "Nome azienda richiesto"),
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email().optional().or(z.literal("")),
  vatNumber: z.string().optional(),
  fiscalCode: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

export type GeneralSettingsData = z.infer<typeof generalSettingsSchema>;

// --- SUPPLIER DELIVERY SCHEMA ---
export const deliverySchema = z.object({
  supplierName: z.string().min(2, "Nome fornitore richiesto"),
  documentNumber: z.string().min(1, "Numero documento richiesto"),
  listNumber: z.string().optional(),
  deliveryDate: z.coerce.date(),
  totalAmount: z.coerce.number().min(0, "Importo totale richiesto"),
  taxAmount: z.coerce.number().min(0, "IVA richiesta"),
  notes: z.string().optional(),
  pdfUrl: z.string().optional(),
});

export type DeliveryFormData = z.infer<typeof deliverySchema>;
