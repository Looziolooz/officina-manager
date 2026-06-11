import { getQuoteById } from "@/app/actions/quotes";
import { updateQuoteStatus, convertQuoteToJob, convertQuoteToInvoice } from "@/app/actions/quotes";
import { QuoteStatus } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuoteById(id);

  if (!quote) {
    redirect("/admin/quotes");
  }

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

  async function handleStatusChange(formData: FormData) {
    "use server";
    const newStatus = formData.get("status") as QuoteStatus;
    await updateQuoteStatus(id, newStatus);
  }

  async function handleConvertToJob() {
    "use server";
    await convertQuoteToJob(id);
  }

  async function handleConvertToInvoice() {
    "use server";
    await convertQuoteToInvoice(id);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Preventivo {quote.quoteNumber}</h1>
        <Link
          href="/admin/quotes"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Torna alla lista
        </Link>
      </div>

      {/* Status Banner */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
             <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${statusColors[quote.status ?? "DRAFT"]}`}>
               {statusLabels[quote.status ?? "DRAFT"] || quote.status || "DRAFT"}
             </span>
          </div>
          <div className="flex gap-2">
            {quote.status === "DRAFT" && (
              <form action={handleStatusChange}>
                <input type="hidden" name="status" value="SENT" />
                <button
                  type="submit"
                  className="bg-blue-600 text-foreground px-4 py-2 rounded hover:bg-blue-700 text-sm"
                >
                  Invia Preventivo
                </button>
              </form>
            )}
            {quote.status === "SENT" && (
              <>
                <form action={handleStatusChange}>
                  <input type="hidden" name="status" value="ACCEPTED" />
                  <button
                    type="submit"
                    className="bg-green-600 text-foreground px-4 py-2 rounded hover:bg-green-700 text-sm"
                  >
                    Accetta
                  </button>
                </form>
                <form action={handleStatusChange}>
                  <input type="hidden" name="status" value="REJECTED" />
                  <button
                    type="submit"
                    className="bg-red-600 text-foreground px-4 py-2 rounded hover:bg-red-700 text-sm"
                  >
                    Rifiuta
                  </button>
                </form>
              </>
            )}
            {quote.status === "ACCEPTED" && !quote.convertedJobId && (
              <form action={handleConvertToJob}>
                <button
                  type="submit"
                  className="bg-purple-600 text-foreground px-4 py-2 rounded hover:bg-purple-700 text-sm"
                >
                  Converti in Lavoro
                </button>
              </form>
            )}
            {quote.status === "ACCEPTED" && !quote.convertedInvoiceId && (
              <form action={handleConvertToInvoice}>
                <button
                  type="submit"
                  className="bg-indigo-600 text-foreground px-4 py-2 rounded hover:bg-indigo-700 text-sm"
                >
                  Converti in Fattura
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Customer and Vehicle Info */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Cliente</h3>
            <p className="font-medium">{quote.customer.firstName} {quote.customer.lastName}</p>
            <p className="text-sm text-muted-foreground">{quote.customer.email}</p>
            <p className="text-sm text-muted-foreground">{quote.customer.phone}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Veicolo</h3>
            <p className="font-medium">{quote.vehicle.plate}</p>
            <p className="text-sm text-muted-foreground">{quote.vehicle.brand} {quote.vehicle.modelName}</p>
            {quote.km && <p className="text-sm text-muted-foreground">KM: {quote.km}</p>}
          </div>
        </div>

        {/* Work Description */}
        {quote.workDescription && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Descrizione Lavoro</h3>
            <p className="text-gray-700">{quote.workDescription}</p>
          </div>
        )}

        {/* Items */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Articoli e Servizi</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Descrizione</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Qtà</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Prezzo Unit.</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Sconto</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">IVA</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Totale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Labor */}
              {(quote.laborHours ?? 0) > 0 && (
                <tr>
                  <td className="px-4 py-2">Ore Lavoro ({(quote.laborHours ?? 0)}h)</td>
                  <td className="px-4 py-2">{quote.laborHours ?? 0}</td>
                  <td className="px-4 py-2">€ {(quote.laborRate ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-2">-</td>
                  <td className="px-4 py-2">22%</td>
                  <td className="px-4 py-2">€ {((quote.laborHours ?? 0) * (quote.laborRate ?? 0)).toFixed(2)}</td>
                </tr>
              )}
              {/* Items */}
              {quote.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2">
                    {item.description}
                    {item.isPartProvidedByCustomer && (
                      <span className="ml-2 text-xs text-muted-foreground">(Fornito dal cliente)</span>
                    )}
                  </td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2">€ {item.unitPrice.toFixed(2)}</td>
                  <td className="px-4 py-2">€ {(item.discount || 0).toFixed(2)}</td>
                  <td className="px-4 py-2">{item.vatRate}%</td>
                  <td className="px-4 py-2">€ {item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t pt-4">
          <div className="flex justify-end">
            <div className="w-64">
               <div className="flex justify-between py-1">
                 <span>Imponibile:</span>
                 <span>€ {(quote.subtotal ?? 0).toFixed(2)}</span>
               </div>
               <div className="flex justify-between py-1">
                 <span>IVA ({quote.taxRate ?? 22}%):</span>
                 <span>€ {(quote.taxAmount ?? 0).toFixed(2)}</span>
               </div>
               <div className="flex justify-between py-2 font-bold text-lg border-t">
                 <span>Totale:</span>
                 <span>€ {(quote.total ?? 0).toFixed(2)}</span>
               </div>
            </div>
          </div>
        </div>

         {/* Dates */}
         <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
           <p>Creato il: {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : "-"}</p>
           <p>Validità fino al: {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : "-"}</p>
          {quote.convertedJobId && (
            <p className="text-purple-600">
              Convertito in lavoro: 
              <Link href={`/admin/workshop/${quote.convertedJobId}`} className="underline">
                Vai al lavoro
              </Link>
            </p>
          )}
          {quote.convertedInvoiceId && (
            <p className="text-indigo-600">
              Convertito in fattura: 
              <Link href={`/admin/accounting/invoices/${quote.convertedInvoiceId}`} className="underline">
                Vai alla fattura
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
