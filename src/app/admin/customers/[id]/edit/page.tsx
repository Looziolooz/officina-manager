import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import EditCustomerForm from "@/components/admin/EditCustomerForm";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
  });

  if (!customer) notFound();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Modifica Cliente</h1>
      <EditCustomerForm customer={customer} />
    </div>
  );
}