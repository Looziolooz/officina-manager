"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSMSProviders } from "@/app/actions/sms";
import { upsertSMSProvider } from "@/app/actions/sms";

export default function SMSSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    provider: "TWILIO",
    name: "",
    isEnabled: true,
    priority: 1,
    dailyLimit: 100,
    costPerSMS: 0.08,
  });

  useEffect(() => {
    loadProviders();
  }, []);

  async function loadProviders() {
    const data = await getSMSProviders();
    setProviders(data);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : 
               type === "number" ? parseFloat(value) : value
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, String(value));
    });

    const result = await upsertSMSProvider(formDataObj);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      loadProviders();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.message || "Errore durante il salvataggio");
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800">
          ← Indietro
        </button>
        <h1 className="text-2xl font-bold">Configurazione SMS</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          Provider salvato con successo!
        </div>
      )}

      {/* Provider List */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-4">Provider Configurati</h3>
        {providers.length === 0 ? (
          <p className="text-muted-foreground">Nessun provider configurato</p>
        ) : (
          <div className="space-y-3">
            {providers.map((p) => (
              <div key={p.provider} className="border p-3 rounded flex justify-between items-center">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Priorità: {p.priority} | Limite: {p.dailyLimit}/giorno | Costo: €{p.costPerSMS}/SMS
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${p.isEnabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                  {p.isEnabled ? "Attivo" : "Disattivo"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Provider */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-medium mb-4">Aggiungi/Modifica Provider</h3>

        <div>
          <label className="block text-sm font-medium mb-1">Provider</label>
          <select
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="TWILIO">Twilio</option>
            <option value="VONAGE">Vonage</option>
            <option value="MESSAGEBIRD">MessageBird</option>
            <option value="MANUAL">Manuale</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Es. Twilio Production"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Priorità</label>
            <input
              type="number"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              min="1"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Limite Giornaliero</label>
            <input
              type="number"
              name="dailyLimit"
              value={formData.dailyLimit}
              onChange={handleChange}
              min="0"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Costo per SMS (€)</label>
            <input
              type="number"
              name="costPerSMS"
              value={formData.costPerSMS}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isEnabled"
            checked={formData.isEnabled}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-sm">Provider abilitato</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-foreground px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Salvataggio..." : "Salva Provider"}
        </button>
      </form>
    </div>
  );
}
