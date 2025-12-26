import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login", // Se non sei loggato, vieni mandato qui
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      
      if (isOnAdmin) {
        if (isLoggedIn) return true;
        return false; // Redirect al login
      } else if (isLoggedIn && nextUrl.pathname === "/login") {
        // Se sei già loggato e vai su /login, ti rimanda alla dashboard
        return Response.redirect(new URL("/admin/dashboard", nextUrl));
      }
      return true;
    },
  },
  providers: [], // Configurato in auth.ts per evitare problemi con Edge
} satisfies NextAuthConfig;