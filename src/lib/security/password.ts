import { z } from "zod";

// Zod Schema per validazione form
export const passwordSchema = z
  .string()
  .min(8, "La password deve essere di almeno 8 caratteri") // Rilassato per UX, ma strict nell'analisi
  .refine((pwd) => /[A-Z]/.test(pwd), "Deve contenere una maiuscola")
  .refine((pwd) => /[0-9]/.test(pwd), "Deve contenere un numero")
  .refine((pwd) => /[^a-zA-Z0-9]/.test(pwd), "Deve contenere un carattere speciale");

export function calculatePasswordStrength(password: string) {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 20;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^a-zA-Z0-9]/.test(password)) score += 30;

  let level = "weak";
  if (score >= 90) level = "very_strong";
  else if (score >= 70) level = "strong";
  else if (score >= 50) level = "good";
  else if (score >= 30) level = "fair";

  return { score, level };
}