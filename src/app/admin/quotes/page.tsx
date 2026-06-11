import Link from "next/link";
import { getQuotes } from "@/app/actions/quotes";
import { QuoteStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status as QuoteStatus | undefined;
  const quotes = await getQuotes(statusFilter);

  const statusLabels: Record<string, string> = {
    DRAFT: "Bozza",
    SENT: "Inviato",
    ACCEPTED: "Accettato",
    REJECTED: "Rifiutato",
    CONVERTED: "Convertito",
    EXPIRED: "Scaduto",
  };

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    SENT: "bg-blue-100 text-blue-800",
    ACCEPTED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    CONVERTED: "bg-purple-100 text-purple-800",
    EXPIRED: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Preventivi</h1>
        <Link
          href="/admin/quotes/new"
          className="bg-blue-600 text-foreground px-4 py-2 rounded hover:bg-blue-700"
        >
          Nuovo Preventivo
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-2">
        <Link
          href="/admin/quotes"
          className={`px-3 py-1 rounded ${!statusFilter ? "bg-blue-600 text-foreground" : "bg-gray-200"}`}
        >
          Tutti
        </Link>
        {Object.entries(statusLabels).map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/quotes?status=${key}`}
            className={`px-3 py-1 rounded ${statusFilter === key ? "bg-blue-600 text-foreground" : "bg-gray-200"}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Quotes Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Numero
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Veicolo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Totale
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Stato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Scadenza
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {quotes.map((quote) => (
              <tr key={quote.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {quote.quoteNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {quote.customer.firstName} {quote.customer.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {quote.vehicle.plate} - {quote.vehicle.brand} {quote.vehicle.modelName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  € {(quote.total ?? 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[quote.status ?? "DRAFT"]}`}>
                    {statusLabels[quote.status ?? "DRAFT"] || quote.status || "DRAFT"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    href={`/admin/quotes/${quote.id}`}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Visualizza
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {quotes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nessun preventivo trovato
          </div>
        )}
      </div>
    </div>
  );
}
