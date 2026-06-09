"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NotificationsSettingsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    lowStockEnabled: true,
    lowStockThreshold: 5,
    criticalStockThreshold: 2,
    oilChangeReminders: true,
    inspectionReminders: true,
    appointmentReminders: true,
    paymentReminders: true,
    reminderDaysBefore: 7,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked :
               type === "number" ? parseInt(value) : value
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder for API call
    alert("Impostazioni salvate!");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800">
          ← Indietro
        </button>
        <h1 className="text-2xl font-bold">Impostazioni Notifiche</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <h3 className="text-lg font-medium mb-3">Magazzino</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="lowStockEnabled"
                checked={formData.lowStockEnabled}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm">Abilita avvisi scorte basse</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Soglia scorta bassa</label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  min="1"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Soglia scorta critica</label>
                <input
                  type="number"
                  name="criticalStockThreshold"
                  value={formData.criticalStockThreshold}
                  onChange={handleChange}
                  min="0"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-3">Promemoria Automatici</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="oilChangeReminders"
                checked={formData.oilChangeReminders}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm">Promemoria cambio olio</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="inspectionReminders"
                checked={formData.inspectionReminders}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm">Promemoria revisione</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="appointmentReminders"
                checked={formData.appointmentReminders}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm">Conferma appuntamento</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="paymentReminders"
                checked={formData.paymentReminders}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm">Promemoria pagamenti</span>
            </label>
            <div>
              <label className="block text-sm mb-1">Giorni anticipo promemoria</label>
              <input
                type="number"
                name="reminderDaysBefore"
                value={formData.reminderDaysBefore}
                onChange={handleChange}
                min="1"
                max="30"
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Salva Impostazioni
        </button>
      </form>
    </div>
  );
}
