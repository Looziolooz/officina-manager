// src/lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db"; // Dovrai creare questo file export const prisma = new PrismaClient()

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user) throw new Error("Credenziali non valide.");

        // Controllo Account Lockout
        if (user.lockoutUntil && user.lockoutUntil > new Date()) {
          throw new Error("Account bloccato. Riprova tra 30 minuti.");
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password);

        if (!isValid) {
          // Incrementa tentativi falliti
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              failedAttempts: { increment: 1 },
              lockoutUntil: user.failedAttempts + 1 >= 5 ? new Date(Date.now() + 30 * 60000) : null
            }
          });
          throw new Error("Credenziali non valide.");
        }

        // Reset tentativi su login successo
        await prisma.user.update({
          where: { id: user.id },
          data: { failedAttempts: 0, lockoutUntil: null }
        });

        return { id: user.id, email: user.email, role: user.role };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.role && session.user) {
        session.user.role = token.role;
      }
      return session;
    }
  }
});