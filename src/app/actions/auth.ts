"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    // Forziamo il passaggio dei dati raw per sicurezza
    const data = Object.fromEntries(formData);
    
    await signIn("credentials", {
      ...data,
      redirectTo: "/admin/dashboard", // Forziamo il redirect qui
    });
    
  } catch (error) {
    // IMPORTANTE: NextAuth lancia un errore per fare il redirect.
    // Dobbiamo intercettarlo e rilanciarlo, altrimenti il login "funziona" ma resti fermo.
    if ((error as Error).message.includes('NEXT_REDIRECT')) {
      throw error;
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Credenziali non valide (Email o Password errata).";
        default:
          return "Si è verificato un errore generico.";
      }
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}