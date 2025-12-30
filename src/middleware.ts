import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const isAdminArea = nextUrl.pathname.startsWith("/admin");

  if (isAdminArea && !isLoggedIn) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};