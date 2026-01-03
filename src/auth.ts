import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit";
import { verifyTOTP } from "@/lib/security/2fa";
import { authConfig } from "./auth.config";
import bcrypt from "bcryptjs"; // Assicurati che questo import ci sia

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  code: z.string().optional()
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "2FA Code", type: "text" }
      },
      async authorize(credentials) {
        // 1. Validazione Input
        const parsed = await loginSchema.safeParseAsync(credentials);
        
        if (!parsed.success) return null;
        
        const { email, password, code } = parsed.data;

        // 2. Ricerca Utente
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        // 3. Controllo Lockout
        if (user.isLocked && user.lockedUntil && user.lockedUntil > new Date()) {
          await createAuditLog({
            userId: user.id,
            action: "LOGIN_FAILED",
            description: "Tentativo su account bloccato",
            riskLevel: "HIGH",
            isSuccess: false
          });
          throw new Error("Account bloccato per troppi tentativi. Riprova più tardi.");
        }

        // 4. Verifica Password (FIX: Ora usiamo bcrypt.compare)
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          const newAttempts = user.loginAttempts + 1;
          const shouldLock = newAttempts >= 5; 
          
          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: newAttempts,
              isLocked: shouldLock,
              lockedUntil: shouldLock ? new Date(Date.now() + 30 * 60 * 1000) : null 
            }
          });

          await createAuditLog({
            userId: user.id,
            action: shouldLock ? "ACCOUNT_LOCKED" : "LOGIN_FAILED",
            description: shouldLock ? "Account bloccato" : `Password errata (${newAttempts}/5)`,
            riskLevel: shouldLock ? "CRITICAL" : "MEDIUM",
            isSuccess: false
          });

          console.log(`❌ Login fallito: Password errata per ${email}`);
          return null;
        }

        // 5. Verifica 2FA
        if (user.twoFactorEnabled) {
          if (!code) throw new Error("2FA_REQUIRED"); 
          if (!user.twoFactorSecret) throw new Error("Configurazione 2FA corrotta");

          const is2FAValid = verifyTOTP(code, user.twoFactorSecret);
          
          if (!is2FAValid) {
            await createAuditLog({
              userId: user.id,
              action: "LOGIN_FAILED",
              description: "Codice 2FA errato",
              riskLevel: "HIGH",
              isSuccess: false
            });
            console.log(`❌ Login fallito: 2FA errato per ${email}`);
            return null;
          }
        }

        // 6. Successo
        await prisma.user.update({
          where: { id: user.id },
          data: {
            loginAttempts: 0,
            isLocked: false,
            lockedUntil: null,
            lastLoginSuccess: new Date()
          }
        });

        await createAuditLog({
          userId: user.id,
          action: "LOGIN_SUCCESS",
          description: "Login effettuato con successo",
          isSuccess: true
        });

        console.log(`✅ Login successo: ${user.name}`);
        return user;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  }
});