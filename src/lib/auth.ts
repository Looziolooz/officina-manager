// src/lib/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          throw new Error("Credenziali non valide.");
        }

        // Controllo lockout
        if (user.lockoutUntil && user.lockoutUntil > new Date()) {
          throw new Error("Account bloccato. Riprova tra 30 minuti.");
        }

        // Verifica password
        const isValid = await bcrypt.compare(
          credentials.password as string, 
          user.password
        );

        if (!isValid) {
          const attempts = user.failedAttempts + 1;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedAttempts: attempts,
              lockoutUntil: attempts >= 5 
                ? new Date(Date.now() + 30 * 60 * 1000) 
                : null,
            },
          });
          throw new Error("Credenziali non valide.");
        }

        // Reset tentativi
        await prisma.user.update({
          where: { id: user.id },
          data: { failedAttempts: 0, lockoutUntil: null },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});