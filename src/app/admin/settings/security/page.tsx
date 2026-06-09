"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SecuritySettingsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    minPasswordLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    passwordExpiryDays: 90,
    maxLoginAttempts: 5,
    lockoutMinutes: 30,
    require2FAForAdmins: false,
    sessionTimeoutMinutes: 60,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? parseInt(value) : value
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
        <h1 className="text-2xl font-bold">Impostazioni Sicurezza</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <h3 className="text-lg font-medium mb-3">Password Policy</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Lunghezza minima</label>
              <input
                type="number"
                name="minPasswordLength"
                value={formData.minPasswordLength}
                onChange={handleChange}
                min="6"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="requireUppercase"
                  checked={formData.requireUppercase}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">Richiedi maiuscole</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="requireNumbers"
                  checked={formData.requireNumbers}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">Richiedi numeri</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="requireSpecialChars"
                  checked={formData.requireSpecialChars}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">Richiedi caratteri speciali</span>
              </label>
            </div>
            <div>
              <label className="block text-sm mb-1">Scadenza password (giorni, 0 = mai)</label>
              <input
                type="number"
                name="passwordExpiryDays"
                value={formData.passwordExpiryDays}
                onChange={handleChange}
                min="0"
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-3">Login & Blocco</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Max tentativi falliti</label>
                <input
                  type="number"
                  name="maxLoginAttempts"
                  value={formData.maxLoginAttempts}
                  onChange={handleChange}
                  min="1"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Blocco (minuti)</label>
                <input
                  type="number"
                  name="lockoutMinutes"
                  value={formData.lockoutMinutes}
                  onChange={handleChange}
                  min="1"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-3">Sessioni & 2FA</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Timeout sessione (minuti)</label>
              <input
                type="number"
                name="sessionTimeoutMinutes"
                value={formData.sessionTimeoutMinutes}
                onChange={handleChange}
                min="5"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="require2FAForAdmins"
                checked={formData.require2FAForAdmins}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm">Richiedi 2FA per amministratori</span>
            </label>
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
