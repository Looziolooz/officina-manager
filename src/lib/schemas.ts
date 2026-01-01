import { z } from "zod";

export const customerSchema = z.object({
  firstName: z.string().min(2, "Nome richiesto"),
  lastName: z.string().min(2, "Cognome richiesto"),
  email: z.string().email("Email non valida").optional().or(z.literal("")),
  phone: z.string().min(10, "Telefono non valido (min 10 cifre)"),
  alternatePhone: z.string().optional(),
  address: z.string().optional(),
  technicalNotes: z.string().optional(),
  familyNotes: z.string().optional(),
  plate: z.string().regex(/^[A-Z]{2}[0-9]{3}[A-Z]{2}$/i, "Formato targa errato (es. AA123BB)"),
  brand: z.string().min(2, "Marca richiesta"),
  model: z.string().min(2, "Modello richiesto"),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  fuelType: z.string().optional(),
  vin: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

// NUOVO: Schema specifico per l'aggiornamento anagrafica (senza veicoli)
export const customerEditSchema = customerSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  alternatePhone: true,
  address: true,
});

export type CustomerEditData = z.infer<typeof customerEditSchema>;