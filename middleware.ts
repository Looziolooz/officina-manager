import NextAuth from "next-auth";
import { authConfig } from "./src/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Applica il middleware a tutte le rotte admin tranne static files e immagini
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};