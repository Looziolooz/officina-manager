// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function normalizePlate(plate: string): string {
  return plate.toUpperCase().replace(/\s/g, "").trim();
}

export function normalizePhone(phone: string, defaultCountry = "39"): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) {
    return digits;
  }
  return `+${defaultCountry}${digits.replace(/^0+/, "")}`;
}