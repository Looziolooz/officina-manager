// src/lib/auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth/login",
  },
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
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminArea = nextUrl.pathname.startsWith("/admin");
      
      if (isAdminArea) {
        if (isLoggedIn) return true;
        return false; // Redirect al login
      }
      return true;
    },
  },
  providers: [], // I provider vengono aggiunti in auth.ts
} satisfies NextAuthConfig;