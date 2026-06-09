"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { wasteSchema } from "@/lib/schemas";
import type { WasteFormData } from "@/lib/schemas";
import { createWasteRecord } from "@/app/actions/waste";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewWastePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(wasteSchema) as any,
    defaultValues: {
      unit: "kg",
      movementType: "OUT",
      date: new Date(),
    } as WasteFormData,
  });

  async function onSubmit(data: WasteFormData) {
    setLoading(true);
    setError("");

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        formData.append(
          key,
          value instanceof Date ? value.toISOString() : String(value)
        );
      }
    });

    const result = await createWasteRecord(formData);
    setLoading(false);

    if (result && !result.success) {
      setError(result.message || "Errore durante il salvataggio");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nuovo Sversamento Rifiuti</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Tipo Rifiuto *</label>
          <select
            {...register("type")}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Seleziona tipo...</option>
            <option value="OLIO ESAUSTO">Olio Esausto</option>
            <option value="FILTRI OLIO">Filtri Olio</option>
            <option value="BATTERIE">Batterie</option>
            <option value="PNEUMATICI">Pneumatici</option>
            <option value="METALLI">Metalli</option>
            <option value="PLASTICA">Plastica</option>
            <option value="CARTA/CARTONE">Carta/Cartone</option>
            <option value="RIFIUTI SPECIALI">Rifiuti Speciali</option>
            <option value="ALTRO">Altro</option>
          </select>
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Quantità *</label>
            <input
              type="number"
              step="0.01"
              {...register("quantity", { valueAsNumber: true })}
              className="w-full border rounded px-3 py-2"
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unità</label>
            <select
              {...register("unit")}
              className="w-full border rounded px-3 py-2"
            >
              <option value="kg">kg</option>
              <option value="litri">litri</option>
              <option value="pezzi">pezzi</option>
              <option value="mc">mc</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tipo Movimentazione</label>
          <select
            {...register("movementType")}
            className="w-full border rounded px-3 py-2"
          >
            <option value="OUT">Uscita (Smaltimento)</option>
            <option value="IN">Ingresso (Ricezione)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Data *</label>
          <input
            type="date"
            {...register("date", { valueAsDate: true })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Trasportatore</label>
          <input
            {...register("carrierName")}
            placeholder="Nome ditta trasportatrice"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Numero Documento</label>
          <input
            {...register("documentNumber")}
            placeholder="Es. FORM-2024-001"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Note</label>
          <textarea
            {...register("notes")}
            rows={3}
            className="w-full border rounded px-3 py-2"
            placeholder="Note aggiuntive..."
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Salvataggio..." : "Registra Sversamento"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
}
