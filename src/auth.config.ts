import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login", // Se l'utente non è loggato, viene mandato qui
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // Definisci quali rotte sono protette
      // In questo caso: tutto ciò che inizia con /admin o /dashboard
      const isOnDashboard = nextUrl.pathname.startsWith('/admin') || nextUrl.pathname.startsWith('/dashboard');
      
      const isOnLoginPage = nextUrl.pathname === '/login';

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Reindirizza automaticamente alla pagina di login
      } else if (isLoggedIn && isOnLoginPage) {
        // Se è già loggato e prova ad andare al login, mandalo alla dashboard
        return Response.redirect(new URL('/admin/dashboard', nextUrl));
      }

      return true;
    },
  },
  providers: [], // I provider reali rimangono in auth.ts
} satisfies NextAuthConfig;