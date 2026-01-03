import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit";
import { verifyTOTP } from "@/lib/security/2fa";
import { authConfig } from "./auth.config";
import bcrypt from "bcryptjs"; // Importante: usa bcryptjs per compatibilità con lo script di fix

// --- TYPE AUGMENTATION ---

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"]
  }

  interface User {
    role?: string;
    lockedUntil?: Date | null;
    loginAttempts?: number;
    twoFactorEnabled?: boolean;
    twoFactorSecret?: string | null;
    isLocked?: boolean;
  }
}

// CORREZIONE CRITICA: Estensione corretta del modulo per NextAuth v5
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

// --- SCHEMA DI VALIDAZIONE ---
const loginSchema = z.object({
  email: z.string().email("Inserisci un'email valida"),
  password: z.string().min(1, "La password è richiesta"),
  code: z.string().optional() // Codice 2FA opzionale
});

// --- CONFIGURAZIONE NEXTAUTH ---
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

        // 2. Ricerca Utente nel DB
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        // 3. Controllo Account Bloccato
        if (user.isLocked && user.lockedUntil && user.lockedUntil > new Date()) {
          await createAuditLog({
            userId: user.id,
            action: "LOGIN_FAILED",
            description: "Tentativo su account bloccato temporaneamente",
            riskLevel: "HIGH",
            isSuccess: false
          });
          throw new Error("Account bloccato temporaneamente. Riprova più tardi.");
        }

        // 4. Verifica Password con BCrypt
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          // Logica Incremento Tentativi e Blocco
          const newAttempts = (user.loginAttempts || 0) + 1;
          const shouldLock = newAttempts >= 5;
          
          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: newAttempts,
              isLocked: shouldLock,
              lockedUntil: shouldLock ? new Date(Date.now() + 30 * 60 * 1000) : null // Blocco 30 min
            }
          });

          // Log Audit Fallimento
          await createAuditLog({
            userId: user.id,
            action: shouldLock ? "ACCOUNT_LOCKED" : "LOGIN_FAILED",
            description: shouldLock ? "Account bloccato per troppi tentativi" : `Password errata (${newAttempts}/5)`,
            riskLevel: shouldLock ? "CRITICAL" : "MEDIUM",
            isSuccess: false
          });
          
          console.log(`❌ Login fallito: Password errata per ${email}`);
          return null;
        }

        // 5. Verifica 2FA (se abilitata)
        if (user.twoFactorEnabled) {
          if (!code) throw new Error("2FA_REQUIRED"); 
          if (user.twoFactorSecret && !verifyTOTP(code, user.twoFactorSecret)) {
             await createAuditLog({
                userId: user.id,
                action: "LOGIN_FAILED",
                description: "Codice 2FA errato",
                riskLevel: "HIGH",
                isSuccess: false
             });
             return null;
          }
        }

        // 6. Login Riuscito: Reset Contatori
        await prisma.user.update({
          where: { id: user.id },
          data: {
            loginAttempts: 0,
            isLocked: false,
            lockedUntil: null,
            lastLoginSuccess: new Date()
          }
        });

        // Log Audit Successo
        await createAuditLog({
            userId: user.id,
            action: "LOGIN_SUCCESS",
            description: "Login effettuato con successo",
            isSuccess: true
        });

        // Ritorna l'oggetto user per la sessione
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Al login iniziale, user è disponibile. Lo persistiamo nel token JWT.
      if (user) {
        token.id = user.id as string;
        token.role = (user.role || "VIEWER") as string;
      }
      return token;
    },
    async session({ session, token }) {
      // Passiamo i dati dal token alla sessione utente
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  }
});