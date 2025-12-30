// src/lib/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig, // Espandiamo la configurazione base (callbacks e provider settings)
  providers: [
    {
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Ricerca utente sul DB
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          throw new Error("Credenziali non valide.");
        }

        // 1. Controllo Account Lockout (Protezione Brute Force)
        if (user.lockoutUntil && user.lockoutUntil > new Date()) {
          throw new Error("Account bloccato temporaneamente. Riprova tra 30 minuti.");
        }

        // 2. Verifica Password con Bcrypt
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          // Incremento tentativi falliti e eventuale blocco
          const currentAttempts = user.failedAttempts + 1;
          const isLockout = currentAttempts >= 5;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedAttempts: currentAttempts,
              lockoutUntil: isLockout ? new Date(Date.now() + 30 * 60 * 1000) : null,
            },
          });

          throw new Error("Credenziali non valide.");
        }

        // 3. Login Success: Reset dei contatori di errore
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedAttempts: 0,
            lockoutUntil: null,
          },
        });

        // Restituiamo i dati necessari alla sessione
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    },
  ],
});