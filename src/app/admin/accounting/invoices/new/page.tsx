import { prisma } from "@/lib/db";
import NewInvoiceForm from "@/components/accounting/NewInvoiceForm";

export default async function NewInvoicePage() {
  // Recuperiamo i clienti per il menu a tendina
  const customers = await prisma.customer.findMany({
    orderBy: { lastName: 'asc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      companyName: true,
      vatNumber: true
    }
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Nuova Fattura Manuale</h1>
      <NewInvoiceForm customers={customers} />
    </div>
  );
}