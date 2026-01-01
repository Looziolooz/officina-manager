import { prisma } from "@/lib/db";
import { AuditAction, Role } from "@prisma/client";
import { headers } from "next/headers";

interface AuditParams {
  userId?: string;
  action: AuditAction;
  description: string;
  resource?: string;
  resourceId?: string;
  isSuccess?: boolean;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
}

export async function createAuditLog(params: AuditParams) {
  try {
    let ipAddress = "unknown";
    let userAgent = "unknown";
    
    try {
        const headersList = await headers();
        ipAddress = headersList.get("x-forwarded-for") || "unknown";
        userAgent = headersList.get("user-agent") || "unknown";
    } catch {
        // Fallback se headers() non è disponibile (es. contesti non-request)
    }

    // Recupera info utente per cache (denormalizzazione per performance log)
    let userData = null;
    if (params.userId) {
      userData = await prisma.user.findUnique({
        where: { id: params.userId },
        select: { email: true, name: true, role: true }
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userEmail: userData?.email,
        userName: userData?.name,
        userRole: userData?.role as Role, // Cast esplicito per sicurezza
        action: params.action,
        description: params.description,
        resource: params.resource,
        resourceId: params.resourceId,
        ipAddress,
        userAgent,
        isSuccess: params.isSuccess ?? true,
        riskLevel: params.riskLevel || "LOW",
        metadata: params.metadata || {},
      }
    });
  } catch (e) {
    // Non blocchiamo l'applicazione se il log fallisce, ma lo stampiamo in console
    console.error("Failed to create audit log:", e);
  }
}