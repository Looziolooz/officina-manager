"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quoteSchema, quoteItemSchema } from "@/lib/schemas";
import type { QuoteFormData, QuoteItemFormData } from "@/lib/schemas";
import { createQuote } from "@/app/actions/quotes";
import { getCustomersForSelect, getVehiclesByCustomer } from "@/app/actions/quotes";
import { getPartsForSelect } from "@/app/actions/quotes";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewQuotePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(quoteSchema) as any,
    defaultValues: {
      laborHours: 0,
      laborRate: 45,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    } as QuoteFormData,
  });

  const { fields, append, remove } = useFieldArray<QuoteFormData, "items", "id">({
    control,
    name: "items",
  });

  const selectedCustomerId = watch("customerId");

  useEffect(() => {
    loadCustomers();
    loadParts();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      loadVehicles(selectedCustomerId);
    } else {
      setVehicles([]);
    }
  }, [selectedCustomerId]);

  async function loadCustomers() {
    const data = await getCustomersForSelect();
    setCustomers(data);
  }

  async function loadVehicles(customerId: string) {
    const data = await getVehiclesByCustomer(customerId);
    setVehicles(data);
  }

  async function loadParts() {
    const data = await getPartsForSelect();
    setParts(data);
  }

  async function onSubmit(data: QuoteFormData) {
    setLoading(true);
    setError("");

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key !== "items" && value !== undefined) {
        formData.append(key, value instanceof Date ? value.toISOString() : String(value));
      }
    });

    // Add items as JSON
    if (data.items && data.items.length > 0) {
      formData.append("items", JSON.stringify(data.items));
    }

    const result = await createQuote(formData);
    setLoading(false);

    if (result && !result.success) {
      setError(result.message || "Errore durante il salvataggio");
    }
  }

  function addItem() {
    append({
      description: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      vatRate: 22,
      isPartProvidedByCustomer: false,
    });
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nuovo Preventivo</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Cliente *</label>
          <select
            {...register("customerId")}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Seleziona cliente...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} - {c.phone}
              </option>
            ))}
          </select>
          {errors.customerId && (
            <p className="text-red-500 text-sm mt-1">{errors.customerId.message}</p>
          )}
        </div>

        {/* Vehicle Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Veicolo *</label>
          <select
            {...register("vehicleId")}
            className="w-full border rounded px-3 py-2"
            disabled={!selectedCustomerId}
          >
            <option value="">Seleziona veicolo...</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plate} - {v.brand} {v.modelName}
              </option>
            ))}
          </select>
          {errors.vehicleId && (
            <p className="text-red-500 text-sm mt-1">{errors.vehicleId.message}</p>
          )}
        </div>

        {/* KM and Description */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">KM</label>
            <input
              type="number"
              {...register("km", { valueAsNumber: true })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Validità fino al</label>
            <input
              type="date"
              {...register("validUntil", { valueAsDate: true })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrizione Lavoro</label>
          <textarea
            {...register("workDescription")}
            rows={3}
            className="w-full border rounded px-3 py-2"
            placeholder="Descrizione intervento..."
          />
        </div>

        {/* Labor */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ore Lavoro</label>
            <input
              type="number"
              step="0.5"
              {...register("laborHours", { valueAsNumber: true })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tariffa Oraria (€)</label>
            <input
              type="number"
              step="0.01"
              {...register("laborRate", { valueAsNumber: true })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Items */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Articoli / Ricambi</h3>
            <button
              type="button"
              onClick={addItem}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              + Aggiungi Articolo
            </button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="border p-4 rounded mb-3 space-y-3">
              <div className="flex justify-between">
                <h4 className="font-medium">Articolo {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Rimuovi
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Ricambio (opzionale)</label>
                  <select
                    {...register(`items.${index}.partId`)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Articolo generico...</option>
                    {parts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.name} (Stock: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Descrizione *</label>
                  <input
                    {...register(`items.${index}.description`)}
                    placeholder="Descrizione articolo"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm mb-1">Quantità</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Prezzo Unitario (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Sconto (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.discount`, { valueAsNumber: true })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">IVA (%)</label>
                  <input
                    type="number"
                    {...register(`items.${index}.vatRate`, { valueAsNumber: true })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register(`items.${index}.isPartProvidedByCustomer`)}
                  className="mr-2"
                />
                <label className="text-sm">Ricambio fornito dal cliente</label>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Salvataggio..." : "Crea Preventivo"}
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
