import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        console.log("🔐 Tentativo di login avviato...");
        
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          console.log(`- Email ricevuta: ${email}`);
          
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            console.log("❌ Utente non trovato nel DB.");
            return null;
          }
          
          console.log("- Utente trovato, verifico password...");
          const passwordsMatch = await bcrypt.compare(password, user.password);
          
          if (passwordsMatch) {
            console.log("✅ Password corretta! Accesso consentito.");
            return user;
          } else {
            console.log("❌ Password errata.");
          }
        } else {
          console.log("❌ Dati non validi (formato email o lunghezza password).");
        }
        
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/admin');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; 
      }
      return true;
    },
  },
});