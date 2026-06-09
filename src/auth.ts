import NextAuth, { type DefaultSession } from "next-auth";
import { prisma } from "@/lib/db";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit";
import { verifyTOTP } from "@/lib/security/2fa";
import { authConfig } from "./auth.config";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger"; // Importante: usa bcryptjs per compatibilità con lo script di fix

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

// --- ACCESSO DEV (SOLO SVILUPPO) ---
// Sentinella inviata dal pulsante "Accesso DEV" del login form.
// Deve combaciare con DEV_LOGIN_SENTINEL in src/app/auth/login/page.tsx.
const DEV_LOGIN_SENTINEL = "__DEV_LOGIN__";
// Doppio cancello di sicurezza: il bypass è ATTIVO solo se NON siamo in produzione
// E la variabile ALLOW_DEV_LOGIN è esplicitamente "true". In produzione
// (NODE_ENV === "production" su build/deploy) è sempre disabilitato.
const DEV_LOGIN_ENABLED =
  process.env.NODE_ENV !== "production" && process.env.ALLOW_DEV_LOGIN === "true";

// --- CONFIGURAZIONE NEXTAUTH ---
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "2FA Code", type: "text" }
      },
      async authorize(credentials, request) {
        // 0. Rate limiting check
        if (request && await checkRateLimit(request as unknown as Request)) {
          throw new Error("TOO_MANY_REQUESTS");
        }

        // 1. Validazione Input
        const parsed = await loginSchema.safeParseAsync(credentials);
        
        if (!parsed.success) return null;
        
        const { email, password, code } = parsed.data;

        // 1-bis. ACCESSO DEV SENZA PASSWORD (solo sviluppo, doppio cancello).
        // Entra come seed admin (o primo ADMIN) saltando bcrypt/2FA.
        // NON raggiungibile in produzione: DEV_LOGIN_ENABLED è false se
        // NODE_ENV === "production" oppure ALLOW_DEV_LOGIN !== "true".
        if (DEV_LOGIN_ENABLED && password === DEV_LOGIN_SENTINEL) {
          const seedEmail = process.env.SEED_ADMIN_EMAIL;
          const devUser = seedEmail
            ? await prisma.user.findUnique({ where: { email: seedEmail } })
            : await prisma.user.findFirst({ where: { role: "ADMIN" } });

          if (!devUser) {
            logger.warn("DEV LOGIN: nessun utente admin trovato per il bypass");
            return null;
          }

          logger.warn("DEV LOGIN usato: bypass password (ambiente di sviluppo)");
          await createAuditLog({
            userId: devUser.id,
            action: "LOGIN_SUCCESS",
            description: "Accesso DEV (bypass password, ambiente di sviluppo)",
            riskLevel: "HIGH",
            isSuccess: true,
          });

          return {
            id: devUser.id,
            email: devUser.email,
            name: devUser.name,
            role: devUser.role ?? "VIEWER",
          };
        }

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
          
          logger.warn("Login fallito: Password errata", { email: "***" });
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
            role: user.role ?? "VIEWER",
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