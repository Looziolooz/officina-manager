import Link from "next/link";
import ConfirmSubmitButton from "@/components/ui/ConfirmSubmitButton";
import { getStockAlerts, markAlertAsRead, markAllAlertsAsRead, deleteAlert } from "@/app/actions/notifications";
import { getUnreadAlertsCount } from "@/app/actions/notifications";

export const dynamic = "force-dynamic";

export default async function StockAlertsPage() {
  const [alerts, unreadCount] = await Promise.all([
    getStockAlerts(),
    getUnreadAlertsCount(),
  ]);

  async function handleMarkRead(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await markAlertAsRead(id); // TODO: get from session
  }

  async function handleMarkAllRead() {
    "use server";
    await markAllAlertsAsRead(); // TODO: get from session
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await deleteAlert(id);
  }

  const severityColors: Record<string, string> = {
    WARNING: "bg-yellow-100 border-yellow-400 text-yellow-800",
    CRITICAL: "bg-red-100 border-red-400 text-red-800",
    INFO: "bg-blue-100 border-blue-400 text-blue-800",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Avvisi Magazzino</h1>
          {unreadCount > 0 && (
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} nuovi
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <form action={handleMarkAllRead}>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                Segna tutte come lette
              </button>
            </form>
          )}
          <Link
            href="/admin/warehouse"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Torna al magazzino
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nessun avviso presente
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 hover:bg-gray-50 ${
                  !alert.isRead ? "border-l-4 " + (severityColors[alert.severity || "INFO"] || "") : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          alert.alertType === "CRITICAL_STOCK"
                            ? "bg-red-100 text-red-800"
                            : alert.alertType === "LOW_STOCK"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {alert.alertType === "CRITICAL_STOCK"
                          ? "Scorta Critica"
                          : alert.alertType === "LOW_STOCK"
                          ? "Scorta Bassa"
                          : alert.alertType}
                      </span>
                      {!alert.isRead && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                          NUOVO
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 mb-1">{alert.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Ricambio:{" "}
                        <Link
                          href={`/admin/warehouse`}
                          className="text-blue-600 hover:underline"
                        >
                          {alert.part?.code} - {alert.part?.name}
                        </Link>
                      </span>
                      <span>
                        Stock attuale: {alert.part?.stock} (min: {alert.part?.minStock})
                      </span>
                      <span>
                        {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : "-"}
                      </span>
                    </div>
                    {alert.readById && (
                      <p className="text-xs text-gray-400 mt-1">
                        Letto da {alert.readById} il{" "}
                        {alert.readAt?.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!alert.isRead && (
                      <form action={handleMarkRead} className="inline">
                        <input type="hidden" name="id" value={alert.id} />
                        <button
                          type="submit"
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Segna come letto
                        </button>
                      </form>
                    )}
                    <form action={handleDelete} className="inline">
                      <input type="hidden" name="id" value={alert.id} />
                      <ConfirmSubmitButton
                        className="text-red-600 hover:text-red-900 text-sm"
                        message="Sei sicuro?"
                      >
                        Elimina
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
