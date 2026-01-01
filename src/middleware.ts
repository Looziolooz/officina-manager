import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Matcher per escludere file statici, immagini e le api di next-auth
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};