import Link from "next/link";
import ConfirmSubmitButton from "@/components/ui/ConfirmSubmitButton";
import { getSMSCampaigns, getSMSMessages } from "@/app/actions/sms";
import { updateCampaignStatus, deleteCampaign } from "@/app/actions/sms";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { SMSStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function SMSMarketingPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab || "campaigns";
  
  const [campaigns, messages] = await Promise.all([
    getSMSCampaigns(),
    getSMSMessages(),
  ]);

  async function handleStatusChange(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const status = formData.get("status") as string;
    await updateCampaignStatus(id, status);
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await deleteCampaign(id);
  }

  const statusLabels: Record<string, string> = {
    DRAFT: "Bozza",
    SCHEDULED: "Programmata",
    SENDING: "Invio in corso",
    SENT: "Inviata",
    PAUSED: "In pausa",
    CANCELLED: "Annullata",
  };

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    SCHEDULED: "bg-blue-100 text-blue-800",
    SENDING: "bg-yellow-100 text-yellow-800",
    SENT: "bg-green-100 text-green-800",
    PAUSED: "bg-orange-100 text-orange-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">SMS Marketing</h1>
        <Link
          href="/admin/marketing/sms/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nuova Campagna
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <Link
          href="/admin/marketing/sms?tab=campaigns"
          className={`pb-2 px-1 ${tab === "campaigns" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
        >
          Campagne
        </Link>
        <Link
          href="/admin/marketing/sms?tab=messages"
          className={`pb-2 px-1 ${tab === "messages" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
        >
          Storico Messaggi
        </Link>
      </div>

      {tab === "campaigns" && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Programmata per
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Inviati
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {campaign.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[campaign.status || "DRAFT"]}`}>
                      {statusLabels[campaign.status || "DRAFT"]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(campaign.scheduledFor), "dd/MM/yyyy HH:mm", { locale: it })}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {campaign.totalSent} / {campaign.targetCustomerIds ? JSON.parse(campaign.targetCustomerIds).length : 0}
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {campaign.status === "DRAFT" && (
                      <form action={handleStatusChange} className="inline">
                        <input type="hidden" name="id" value={campaign.id} />
                        <input type="hidden" name="status" value="SCHEDULED" />
                        <button type="submit" className="text-blue-600 hover:text-blue-900">
                          Attiva
                        </button>
                      </form>
                    )}
                    <form action={handleDelete} className="inline">
                      <input type="hidden" name="id" value={campaign.id} />
                      <ConfirmSubmitButton
                        className="text-red-600 hover:text-red-900"
                        message="Sei sicuro?"
                      >
                        Elimina
                      </ConfirmSubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {campaigns.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nessuna campagna trovata
            </div>
          )}
        </div>
      )}

      {tab === "messages" && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Destinatario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Telefono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {messages.map((msg) => (
                <tr key={msg.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {msg.customer
                      ? `${msg.customer.firstName} ${msg.customer.lastName}`
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {msg.phoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {msg.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${
                      msg.status === "SENT" || msg.status === "DELIVERED"
                        ? "bg-green-100 text-green-800"
                        : msg.status === "FAILED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {msg.status}
                    </span>
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {msg.createdAt ? format(new Date(msg.createdAt), "dd/MM/yyyy HH:mm", { locale: it }) : "-"}
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
          {messages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nessun messaggio trovato
            </div>
          )}
        </div>
      )}
    </div>
  );
}
