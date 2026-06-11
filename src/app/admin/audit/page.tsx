import { prisma } from "@/lib/db";
import { AuditAction } from "@prisma/client";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

function FilterForm({ 
  actionFilter, 
  userIdFilter, 
  riskFilter 
}: { 
  actionFilter?: string; 
  userIdFilter?: string; 
  riskFilter?: string; 
}) {
  // This needs to be a client component for onChange
  // For now, use a simple form with submit buttons
  return null;
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; userId?: string; risk?: string }>;
}) {
  const params = await searchParams;
  const actionFilter = params.action as AuditAction | undefined;
  const userIdFilter = params.userId;
  const riskFilter = params.risk;

  const where: any = {};
  if (actionFilter) where.action = actionFilter;
  if (userIdFilter) where.userId = userIdFilter;
  if (riskFilter) where.riskLevel = riskFilter;

  const [logs, users] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const actionLabels: Record<string, string> = {
    LOGIN_SUCCESS: "Login Riuscito",
    LOGIN_FAILED: "Login Fallito",
    LOGOUT: "Logout",
    PASSWORD_CHANGED: "Password Cambiata",
    TWO_FA_ENABLED: "2FA Attivato",
    TWO_FA_DISABLED: "2FA Disattivato",
    ACCOUNT_LOCKED: "Account Bloccato",
    ACCOUNT_UNLOCKED: "Account Sbloccato",
    USER_CREATED: "Utente Creato",
    USER_UPDATED: "Utente Aggiornato",
    USER_DELETED: "Utente Eliminato",
    CUSTOMER_CREATED: "Cliente Creato",
    JOB_CREATED: "Lavoro Creato",
    INVOICE_CREATED: "Fattura Creata",
  };

  const riskColors: Record<string, string> = {
    LOW: "bg-green-100 text-green-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HIGH: "bg-orange-100 text-orange-800",
    CRITICAL: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Audit Log</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <form method="get" className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Azione</label>
            <select name="action" defaultValue={actionFilter || ""} className="w-full border rounded px-3 py-2">
              <option value="">Tutte le azioni</option>
              {Object.entries(actionLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Utente</label>
            <select name="userId" defaultValue={userIdFilter || ""} className="w-full border rounded px-3 py-2">
              <option value="">Tutti gli utenti</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Livello Rischio</label>
            <select name="risk" defaultValue={riskFilter || ""} className="w-full border rounded px-3 py-2">
              <option value="">Tutti</option>
              <option value="LOW">Basso</option>
              <option value="MEDIUM">Medio</option>
              <option value="HIGH">Alto</option>
              <option value="CRITICAL">Critico</option>
            </select>
          </div>
          <div className="col-span-3 flex gap-2">
            <button type="submit" className="bg-blue-600 text-foreground px-4 py-2 rounded hover:bg-blue-700 text-sm">
              Filtra
            </button>
            <Link href="/admin/audit" className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 text-sm">
              Rimuovi filtri
            </Link>
          </div>
        </form>
      </div>

      {/* Logs Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Data/Ora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Utente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Azione</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Descrizione</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Rischio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Stato</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {log.createdAt ? format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: it }) : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="font-medium text-gray-900">
                    {log.user ? log.user.name : log.userName || "Sistema"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {log.user?.email || log.userEmail}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {actionLabels[log.action] || log.action}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                  {log.description || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${riskColors[log.riskLevel || "LOW"]}`}>
                    {log.riskLevel || "LOW"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    log.isSuccess ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {log.isSuccess ? "Successo" : "Fallito"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nessun log trovato
          </div>
        )}
      </div>
    </div>
  );
}
