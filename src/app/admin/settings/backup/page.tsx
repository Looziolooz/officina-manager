"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BackupSettingsPage() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  async function handleExport(type: string) {
    setExporting(true);
    try {
      // Placeholder for export functionality
      alert(`Esportazione ${type} iniziata...`);
      // In a real app, you'd trigger a download or send to email
    } finally {
      setExporting(false);
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    
    setImporting(true);
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      // Placeholder for import API
      alert(`Importazione file ${file.name} iniziata...`);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Indietro
        </button>
        <h1 className="text-2xl font-bold">Backup & Export</h1>
      </div>

      <div className="space-y-6">
        {/* Export Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Esporta Dati</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Esporta i dati del sistema in vari formati per backup o analisi esterna.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleExport("JSON")}
              disabled={exporting}
              className="bg-blue-600 text-foreground px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm"
            >
              Esporta JSON
            </button>
            <button
              onClick={() => handleExport("CSV")}
              disabled={exporting}
              className="bg-green-600 text-foreground px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 text-sm"
            >
              Esporta CSV
            </button>
            <button
              onClick={() => handleExport("SQL")}
              disabled={exporting}
              className="bg-purple-600 text-foreground px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 text-sm"
            >
              Backup SQL
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Importa Dati</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Importa dati da file di backup (JSON o CSV).
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
            <input
              type="file"
              onChange={handleImport}
              accept=".json,.csv,.sql"
              className="hidden"
              id="file-import"
            />
            <label
              htmlFor="file-import"
              className="cursor-pointer text-blue-600 hover:text-blue-800"
            >
              Clicca qui per selezionare un file
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              Formati supportati: JSON, CSV, SQL
            </p>
          </div>
          {importing && (
            <p className="text-sm text-blue-600 mt-2">Importazione in corso...</p>
          )}
        </div>

        {/* Database Backup */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Backup Database</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Crea un backup completo del database PostgreSQL.
          </p>
          <button
            onClick={() => alert("Backup database avviato...")}
            className="bg-red-600 text-foreground px-4 py-2 rounded hover:bg-red-700 text-sm"
          >
            Backup Completo
          </button>
        </div>

        {/* Automated Backups */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Backup Automatici</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configura backup automatici su cloud storage.
          </p>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Abilita backup giornaliero</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Salva su cloud (S3, GCS, etc.)</span>
            </label>
            <button
              onClick={() => alert("Impostazioni salvate!")}
              className="bg-blue-600 text-foreground px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              Salva Configurazione
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
