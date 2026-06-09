import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdminArea = nextUrl.pathname.startsWith("/admin");
      const isOnLoginPage = nextUrl.pathname === "/auth/login";

      if (isOnAdminArea) {
        if (isLoggedIn) return true;
        return false;
      } else if (isLoggedIn && isOnLoginPage) {
        return Response.redirect(new URL("/admin/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;