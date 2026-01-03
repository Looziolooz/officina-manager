import NextAuth, { type DefaultSession } from "next-auth";
import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter"; 
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

// --- TYPE AUGMENTATION ---

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"]
  }

  interface User {
    // Rendiamo role opzionale nell'input per evitare conflitti,
    // ma sarà sempre presente grazie alla logica di authorize/jwt
    role?: string; 
    lockedUntil?: Date | null;
  }
}

// FIX: In NextAuth v5, i tipi JWT si trovano in @auth/core/jwt
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

// --- CONFIGURAZIONE ---

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user) return null;

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error("Account bloccato temporaneamente.");
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) return null;

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
      if (user) {
        token.role = user.role || "VIEWER";
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    }
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);