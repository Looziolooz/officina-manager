import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Funzione helper per unire classi Tailwind senza conflitti
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formattatore valuta (Euro)
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};