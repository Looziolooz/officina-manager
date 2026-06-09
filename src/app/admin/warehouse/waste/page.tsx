import Link from "next/link";
import ConfirmSubmitButton from "@/components/ui/ConfirmSubmitButton";
import { getWasteRecords, getWasteStats } from "@/app/actions/waste";
import { deleteWasteRecord } from "@/app/actions/waste";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function WastePage() {
  const [records, stats] = await Promise.all([
    getWasteRecords(),
    getWasteStats(),
  ]);

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await deleteWasteRecord(id);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Registro Rifiuti</h1>
        <Link
          href="/admin/warehouse/waste/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nuovo Sversamento
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={`${stat.type}-${stat.unit}`} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">{stat.type}</h3>
            <p className="text-2xl font-bold">
              {stat._sum.quantity?.toFixed(2)} {stat.unit}
            </p>
          </div>
        ))}
      </div>

      {/* Records Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Quantità
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tipo Mov.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Trasportatore
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Documento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                   {record.date ? format(new Date(record.date), "dd/MM/yyyy", { locale: it }) : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {record.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.quantity} {record.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded text-xs ${
                    record.movementType === "OUT" 
                      ? "bg-red-100 text-red-800" 
                      : "bg-green-100 text-green-800"
                  }`}>
                    {record.movementType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.carrierName || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.documentNumber || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <form action={handleDelete} className="inline">
                    <input type="hidden" name="id" value={record.id} />
                    <ConfirmSubmitButton
                      className="text-red-600 hover:text-red-900"
                      message="Sei sicuro di voler eliminare questo record?"
                    >
                      Elimina
                    </ConfirmSubmitButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nessun record trovato
          </div>
        )}
      </div>
    </div>
  );
}
