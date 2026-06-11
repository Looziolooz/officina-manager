"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { smsCampaignSchema } from "@/lib/schemas";
import type { SMSCampaignFormData } from "@/lib/schemas";
import { createSMSCampaign } from "@/app/actions/sms";
import { getCustomersForSMS } from "@/app/actions/sms";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewSMSCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [targetType, setTargetType] = useState<"all" | "filtered">("all");

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(smsCampaignSchema),
    defaultValues: {
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      targetAllCustomers: true,
    } as SMSCampaignFormData,
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    const data = await getCustomersForSMS();
    setCustomers(data);
  }

  async function onSubmit(data: SMSCampaignFormData) {
    setLoading(true);
    setError("");

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && key !== "targetVehicleFuelType") {
        formData.append(
          key,
          value instanceof Date ? value.toISOString() : String(value)
        );
      }
    });

    // Handle targetVehicleFuelType separately to avoid empty string issues
    if (data.targetVehicleFuelType && data.targetVehicleFuelType !== "") {
      formData.append("targetVehicleFuelType", data.targetVehicleFuelType);
    }

    const result = await createSMSCampaign(formData);
    setLoading(false);

    if (result && !result.success) {
      setError(result.message || "Errore durante il salvataggio");
    }
  }

  const watchTargetAll = watch("targetAllCustomers");

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nuova Campagna SMS</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Nome Campagna *</label>
          <input
            {...register("name")}
            placeholder="Es. Promozione Tagliando Primavera"
            className="w-full border rounded px-3 py-2"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Messaggio *</label>
          <textarea
            {...register("message")}
            rows={4}
            placeholder="Inserisci il messaggio... (max 160 caratteri)"
            maxLength={160}
            className="w-full border rounded px-3 py-2"
          />
          {errors.message && (
            <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {watch("message")?.length || 0}/160 caratteri
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Programma per *</label>
          <input
            type="datetime-local"
            {...register("scheduledFor", { valueAsDate: true })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.scheduledFor && (
            <p className="text-red-500 text-sm mt-1">{errors.scheduledFor.message}</p>
          )}
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">Target Destinatari</h3>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                value="all"
                checked={targetType === "all"}
                onChange={() => {
                  setTargetType("all");
                  // Update form value
                  register("targetAllCustomers").onChange({ target: { value: true } });
                }}
                className="mr-2"
              />
              <span>Tutti i clienti ({customers.length})</span>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                value="filtered"
                checked={targetType === "filtered"}
                onChange={() => {
                  setTargetType("filtered");
                  register("targetAllCustomers").onChange({ target: { value: false } });
                }}
                className="mr-2"
              />
              <span>Clienti filtrati</span>
            </label>
          </div>

          {targetType === "filtered" && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm mb-1">Spesa minima (€)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("targetMinTotalSpent", { valueAsNumber: true })}
                  placeholder="0"
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Tipo carburante veicolo</label>
                <select
                  {...register("targetVehicleFuelType")}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Tutti</option>
                  <option value="Benzina">Benzina</option>
                  <option value="Diesel">Diesel</option>
                  <option value="GPL">GPL</option>
                  <option value="Metano">Metano</option>
                  <option value="Elettrico">Elettrico</option>
                  <option value="Ibrido">Ibrido</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-foreground px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Salvataggio..." : "Crea Campagna"}
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
