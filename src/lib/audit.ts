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

// --- FUNZIONE CRUD MAPPPING ---
const CRUD_ACTION_MAP: Record<string, Record<string, AuditAction>> = {
  Customer: {
    CREATE: "CUSTOMER_CREATED",
    UPDATE: "CUSTOMER_UPDATED",
    DELETE: "CUSTOMER_DELETED",
  },
  Job: {
    CREATE: "JOB_CREATED",
    UPDATE: "JOB_UPDATED",
    DELETE: "JOB_DELETED",
  },
  Invoice: {
    CREATE: "INVOICE_CREATED",
    UPDATE: "INVOICE_UPDATED",
    DELETE: "INVOICE_CANCELLED",
  },
  Expense: {
    CREATE: "EXPENSE_CREATED",
    UPDATE: "EXPENSE_UPDATED",
    DELETE: "EXPENSE_DELETED",
  },
  Part: {
    CREATE: "PART_CREATED",
    UPDATE: "PART_UPDATED",
    DELETE: "PART_DELETED",
  },
  StockMovement: {
    CREATE: "STOCK_ADJUSTED",
  },
};

export async function auditCRUD(
  action: "CREATE" | "UPDATE" | "DELETE",
  resource: string,
  resourceId: string,
  userId?: string,
  oldValue?: Record<string, unknown>,
  newValue?: Record<string, unknown>
) {
  const resourceMap = CRUD_ACTION_MAP[resource];
  const auditAction = resourceMap?.[action] ?? "USER_UPDATED";

  await createAuditLog({
    userId,
    action: auditAction,
    description: `${resource} ${action.toLowerCase()}d`,
    resource,
    resourceId,
    metadata: { oldValue, newValue },
  });
}