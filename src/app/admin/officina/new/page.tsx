"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createJob } from "@/app/actions/workshop";
import { searchCustomers } from "@/app/actions/crm";

interface ClienteRisultato {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  familyNotes: string | null;
  vehicles: Array<{ plate: string; model: string; year?: number | null }>;
}

export default function PaginaIngresso() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  
  const [ricerca, setRicerca] = useState("");
  const [risultati, setRisultati] = useState<ClienteRisultato[]>([]);
  const [clienteSelezionato, setClienteSelezionato] = useState<ClienteRisultato | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (ricerca.length >= 2) {
        const res = await searchCustomers(ricerca) as ClienteRisultato[];
        setRisultati(res);
      } else {
        setRisultati([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [ricerca]);

  const selezionaCliente = (c: ClienteRisultato) => {
    setClienteSelezionato(c);
    setRicerca("");
    setRisultati([]);
  };

  async function gestisciInvio(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrore(null);

    const formData = new FormData(event.currentTarget);
    try {
      const result = await createJob(formData);
      if (result.success) {
        router.push("/admin/officina");
        router.refresh();
      } else {
        setErrore(result.error || "Errore durante il salvataggio.");
      }
    } catch {
      setErrore("Errore tecnico di connessione.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = "w-full p-3 bg-slate-100 border-2 border-slate-300 rounded-lg text-slate-900 font-semibold focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-400";
  const labelStyle = "text-xs font-black text-slate-700 uppercase tracking-wider mb-1 block";

  return (
    <div className="p-6 max-w-5xl mx-auto bg-slate-50 min-h-screen text-slate-900">
      <h1 className="text-3xl font-black mb-8 uppercase tracking-tight">Registrazione Ingresso</h1>

      {/* RICERCA RAPIDA */}
      <div className="mb-8 p-6 bg-slate-900 rounded-2xl shadow-xl border-b-4 border-blue-600">
        <label className="block text-sm font-bold text-slate-300 mb-3 uppercase">Cerca Cliente (Nome, Cognome o Targa)</label>
        <div className="relative">
          <input
            type="text"
            className="w-full p-4 bg-slate-800 border-2 border-slate-700 rounded-xl text-white font-bold outline-none focus:border-blue-400"
            placeholder="Scrivi qui per cercare..."
            value={ricerca}
            onChange={(e) => setRicerca(e.target.value)}
          />
          {risultati.length > 0 && (
            <div className="absolute w-full mt-2 bg-white border-2 border-blue-600 rounded-xl shadow-2xl z-50 overflow-hidden">
              {risultati.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="w-full text-left p-4 hover:bg-blue-50 border-b last:border-0 flex justify-between items-center group"
                  onClick={() => selezionaCliente(c)}
                >
                  <div>
                    <p className="font-black text-slate-900 uppercase">{c.firstName} {c.lastName}</p>
                    <p className="text-sm text-slate-600 font-bold">{c.phone} {c.vehicles[0] ? `| ${c.vehicles[0].plate}` : ""}</p>
                  </div>
                  <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-md uppercase">Seleziona</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={gestisciInvio} className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* COLONNA SINISTRA */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
            <h2 className="text-lg font-black text-blue-700 mb-5 uppercase">Anagrafica Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelStyle}>Nome *</label>
                <input className={inputStyle} name="firstName" defaultValue={clienteSelezionato?.firstName || ""} required />
              </div>
              <div>
                <label className={labelStyle}>Cognome *</label>
                <input className={inputStyle} name="lastName" defaultValue={clienteSelezionato?.lastName || ""} required />
              </div>
              <div>
                <label className={labelStyle}>Telefono *</label>
                <input className={inputStyle} name="phone" type="tel" defaultValue={clienteSelezionato?.phone || ""} required />
              </div>
              <div>
                <label className={labelStyle}>Email *</label>
                <input className={inputStyle} name="email" type="email" defaultValue={clienteSelezionato?.email || ""} required />
              </div>
              <div className="md:col-span-2">
                <label className={labelStyle}>Note Familiari *</label>
                <input className={inputStyle} name="familyNotes" defaultValue={clienteSelezionato?.familyNotes || ""} placeholder="Riferimenti altri familiari" required />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
            <h2 className="text-lg font-black text-orange-600 mb-5 uppercase">Descrizione Intervento *</h2>
            <textarea className={`${inputStyle} min-h-[160px]`} name="description" placeholder="Dettagli del lavoro richiesto..." required />
          </div>
        </div>

        {/* COLONNA DESTRA */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
            <h2 className="text-lg font-black text-green-700 mb-5 uppercase">Dati Mezzo</h2>
            <div className="space-y-4">
              <div>
                <label className={labelStyle}>Targa *</label>
                <input className={`${inputStyle} font-mono uppercase text-xl`} name="plate" defaultValue={clienteSelezionato?.vehicles[0]?.plate || ""} required />
              </div>
              <div>
                <label className={labelStyle}>Marca e Modello *</label>
                <input className={inputStyle} name="model" defaultValue={clienteSelezionato?.vehicles[0]?.model || ""} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>Anno Produzione *</label>
                  <input className={inputStyle} name="year" type="number" defaultValue={clienteSelezionato?.vehicles[0]?.year || ""} required />
                </div>
                <div>
                  <label className={labelStyle}>Chilometri *</label>
                  <input className={inputStyle} name="km" type="number" required />
                </div>
              </div>
            </div>
          </div>

          {errore && (
            <div className="p-4 bg-red-100 text-red-800 rounded-xl border-l-8 border-red-600 font-bold uppercase text-xs">
              ⚠️ {errore}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button type="submit" disabled={loading} className="w-full py-4 bg-blue-700 text-white rounded-xl font-black text-xl uppercase shadow-lg hover:bg-blue-800 disabled:bg-slate-300 transition-all">
              {loading ? "Salvataggio..." : "Conferma Ingresso"}
            </button>
            <button type="button" onClick={() => router.back()} className="w-full py-3 bg-slate-200 text-slate-700 rounded-xl font-black uppercase text-xs">
              Annulla
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}