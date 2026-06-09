import { auth } from "@/auth";
import { Role } from "@prisma/client";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non autorizzato");
  }
  return session;
}

export async function requireRole(allowed: Role[]) {
  const session = await requireSession();
  const userRole = session.user.role as Role;
  if (!allowed.includes(userRole)) {
    throw new Error("Permessi insufficienti");
  }
  return session;
}
