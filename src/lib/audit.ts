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
        // Fallback
    }

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
        userRole: userData?.role as Role,
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
    console.error("Failed to create audit log:", e);
  }
}

// --- FUNZIONE MANCANTE AGGIUNTA QUI ---
export async function auditCRUD(
  action: "CREATE" | "UPDATE" | "DELETE",
  resource: string,
  resourceId: string,
  userId?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oldValue?: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newValue?: any
) {
  // Mappatura dinamica o switch case per determinare l'azione specifica
  let auditAction: AuditAction;

  // Esempio di logica semplice per mappare le stringhe agli Enum
  if (resource === "Customer") {
     if (action === "CREATE") auditAction = "CUSTOMER_CREATED";
     // Nota: assicurati di avere CUSTOMER_UPDATED etc nel tuo schema Prisma se vuoi usarli
     // Altrimenti usa un fallback generico se esiste, o estendi lo schema.
     else auditAction = "USER_UPDATED"; // Fallback temporaneo se manca l'enum specifico
  } else {
     // Fallback generico
     auditAction = action === "CREATE" ? "JOB_CREATED" : "USER_UPDATED"; 
  }

  await createAuditLog({
    userId,
    action: auditAction,
    description: `${resource} ${action.toLowerCase()}d`,
    resource,
    resourceId,
    metadata: { oldValue, newValue }
  });
}