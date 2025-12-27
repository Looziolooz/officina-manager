"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, Car, User, Clock, Package, 
  Trash2, CheckCircle, Plus, AlertCircle, Save 
} from "lucide-react";

// --- INTERFACCE PER TYPESCRIPT ---
interface Part {
  id: number;
  name: string;
  quantity: number;
  price: number;
  notes: string;
}

interface Labor {
  id: number;
  mechanic: string;
  hours: number;
  rate: number;
  notes: string;
}

// Questa interfaccia risolve l'errore "any" (Righe 53 e 112)
interface Job {
  id: string;
  customer: string;
  vehicle: string;
  plate: string;
  status: string;
  description: string;
  parts?: Part[];
  labor?: Labor[];
}

export default function JobDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [isSaving, setIsSaving] = useState(false);

  const [jobHeader, setJobHeader] = useState({
    customer: "Caricamento...",
    vehicle: "",
    status: "todo",
    description: "",
  });

  const [parts, setParts] = useState<Part[]>([]);
  const [labor, setLabor] = useState<Labor[]>([]);

  // --- USE EFFECT CORRETTO (Risolve cascading renders) ---
  useEffect(() => {
    if (!id) return;

    const timer = setTimeout(() => {
      const storedJobs: Job[] = JSON.parse(localStorage.getItem("workshopJobs") || "[]");
      const foundJob = storedJobs.find((j) => j.id === String(id));

      if (foundJob) {
        setJobHeader({
          customer: foundJob.customer,
          vehicle: `${foundJob.vehicle} - ${foundJob.plate}`,
          status: foundJob.status,
          description: foundJob.description,
        });

        if (foundJob.parts) setParts(foundJob.parts);
        if (foundJob.labor) setLabor(foundJob.labor);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [id]);

  // --- FUNZIONI DI GESTIONE ---
  const addPart = () => {
    setParts([...parts, { id: Date.now(), name: "", quantity: 1, price: 0, notes: "" }]);
  };

  const removePart = (partId: number) => {
    setParts(parts.filter(p => p.id !== partId));
  };

  const updatePart = (partId: number, field: keyof Part, value: string | number) => {
    setParts(parts.map(p => p.id === partId ? { ...p, [field]: value } : p));
  };

  const addLabor = () => {
    setLabor([...labor, { id: Date.now(), mechanic: "Meccanico", hours: 1, rate: 50, notes: "" }]);
  };

  const removeLabor = (laborId: number) => {
    setLabor(labor.filter(l => l.id !== laborId));
  };

  const updateLabor = (laborId: number, field: keyof Labor, value: string | number) => {
    setLabor(labor.map(l => l.id === laborId ? { ...l, [field]: value } : l));
  };

  // --- CALCOLO TOTALI ---
  const partsTotal = parts.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const laborTotal = labor.reduce((acc, item) => acc + (item.hours * item.rate), 0);
  const subTotal = partsTotal + laborTotal;
  const vat = subTotal * 0.22;
  const total = subTotal + vat;

  // --- SALVATAGGIO ---
  const handleSave = async () => {
    setIsSaving(true);
    
    const storedJobs: Job[] = JSON.parse(localStorage.getItem("workshopJobs") || "[]");
    const updatedJobs = storedJobs.map((j) => {
        if (j.id === String(id)) {
            return {
                ...j,
                parts: parts,
                labor: labor
            };
        }
        return j;
    });

    localStorage.setItem("workshopJobs", JSON.stringify(updatedJobs));

    await new Promise(r => setTimeout(r, 800));
    setIsSaving(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/officina"
            className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-white">Lavoro #{id}</h1>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full border 
                ${jobHeader.status === 'done' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                  jobHeader.status === 'progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 
                  'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                {jobHeader.status === 'done' ? 'Completato' : jobHeader.status === 'progress' ? 'In Lavorazione' : 'Da Fare'}
              </span>
            </div>
            <p className="text-slate-400">Scheda dettaglio intervento</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Salvataggio..." : "Salva Modifiche"}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-lg shadow-green-900/20">
            <CheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Chiudi Lavoro</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Colonna Sinistra */}
        <div className="space-y-6 lg:col-span-2">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Dati Intervento
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Cliente</p>
                <div className="flex items-center gap-2 text-slate-200">
                   <User className="w-4 h-4 text-slate-500" />
                   {jobHeader.customer}
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Veicolo</p>
                <div className="flex items-center gap-2 text-slate-200">
                   <Car className="w-4 h-4 text-slate-500" />
                   {jobHeader.vehicle}
                </div>
              </div>
            </div>
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
               <p className="text-xs text-slate-500 uppercase font-bold mb-2">Descrizione Problema</p>
               <p className="text-slate-300 text-sm leading-relaxed">{jobHeader.description}</p>
            </div>
          </div>

          {/* Sezione Ricambi */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-500" />
                Ricambi utilizzati
              </h3>
              <button 
                onClick={addPart}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded flex items-center gap-1 transition-colors border border-slate-700"
              >
                <Plus className="w-3 h-3" /> Aggiungi Riga
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 w-[40%]">Articolo / Note</th>
                    <th className="pb-3 w-[15%] text-center">Qtà</th>
                    <th className="pb-3 w-[20%] text-right">Prezzo (€)</th>
                    <th className="pb-3 w-[15%] text-right">Totale</th>
                    <th className="pb-3 w-[10%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {parts.map((part) => (
                    <tr key={part.id}>
                      <td className="py-3 align-top">
                        <input 
                          type="text" 
                          value={part.name}
                          onChange={(e) => updatePart(part.id, "name", e.target.value)}
                          placeholder="Nome ricambio..."
                          className="w-full bg-transparent text-white focus:outline-none mb-1 font-medium"
                        />
                        <input 
                          type="text" 
                          value={part.notes}
                          onChange={(e) => updatePart(part.id, "notes", e.target.value)}
                          placeholder="+ Aggiungi nota..."
                          className="w-full bg-transparent text-xs text-slate-400 focus:outline-none"
                        />
                      </td>
                      <td className="py-3 align-top">
                        <input 
                          type="number" 
                          value={part.quantity}
                          onChange={(e) => updatePart(part.id, "quantity", parseFloat(e.target.value) || 0)}
                          className="w-full text-center bg-slate-950/50 border border-slate-800 rounded py-1 text-white focus:outline-none"
                        />
                      </td>
                      <td className="py-3 align-top">
                        <input 
                          type="number" 
                          value={part.price}
                          onChange={(e) => updatePart(part.id, "price", parseFloat(e.target.value) || 0)}
                          className="w-full text-right bg-slate-950/50 border border-slate-800 rounded py-1 text-white focus:outline-none"
                        />
                      </td>
                      <td className="py-3 text-right font-medium text-slate-200 align-top pt-4">
                        € {(part.price * part.quantity).toFixed(2)}
                      </td>
                      <td className="py-3 text-right align-top pt-2">
                        <button onClick={() => removePart(part.id)} className="text-slate-600 hover:text-red-500 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Colonna Destra */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-500" />
                Manodopera
              </h3>
              <button onClick={addLabor} className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded flex items-center gap-1 border border-slate-700">
                <Plus className="w-3 h-3" /> Aggiungi
              </button>
            </div>

            <div className="space-y-4">
              {labor.map((item) => (
                <div key={item.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 relative group">
                  <button onClick={() => removeLabor(item.id)} className="absolute top-2 right-2 text-slate-600 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <input 
                    type="text" 
                    value={item.mechanic}
                    onChange={(e) => updateLabor(item.id, "mechanic", e.target.value)}
                    className="w-full bg-transparent text-white text-sm font-medium focus:outline-none mb-2"
                  />
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <input 
                      type="number" 
                      value={item.hours}
                      onChange={(e) => updateLabor(item.id, "hours", parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                    />
                    <input 
                      type="number" 
                      value={item.rate}
                      onChange={(e) => updateLabor(item.id, "rate", parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm text-right"
                    />
                  </div>
                  <input 
                    type="text" 
                    value={item.notes}
                    onChange={(e) => updateLabor(item.id, "notes", e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-400 focus:outline-none"
                    placeholder="Note..."
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Riepilogo */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-white font-semibold mb-4">Riepilogo Costi</h3>
            <div className="space-y-3 text-sm text-slate-400 border-b border-slate-800 pb-4 mb-4">
              <div className="flex justify-between"><span>Totale Ricambi</span><span>€ {partsTotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Totale Manodopera</span><span>€ {laborTotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>IVA (22%)</span><span>€ {vat.toFixed(2)}</span></div>
            </div>
            <div className="flex justify-between items-end mb-6">
              <span className="text-slate-300 font-medium text-lg">Totale Finale</span>
              <span className="text-3xl font-bold text-orange-500">€ {total.toFixed(2)}</span>
            </div>
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-bold">Scarica Preventivo PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
}