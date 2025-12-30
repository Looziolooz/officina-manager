import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Proteggiamo le rotte admin e api/admin
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};