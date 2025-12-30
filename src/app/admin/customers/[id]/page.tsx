// src/app/admin/customers/[id]/page.tsx
"use client";
import { use } from "react";
// Rimosso motion poiché non usato in questa vista specifica
import { 
  FileText, 
  User, 
  History, 
  ShieldAlert,
  ChevronLeft
} from "lucide-react"; // Rimosse Car e Plus
import Link from "next/link";

// ... resto del codice rimane invariato

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header con Navigazione */}
      <div className="mb-8 flex items-center justify-between">
        <Link href="/admin/customers" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft size={20} /> Torna alla lista {id && <span className="sr-only">ID: {id}</span>}
        </Link>
        <div className="flex gap-4">
          <button className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all">
            Modifica Profilo
          </button>
          <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-700 transition-all">
            Nuovo Intervento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary text-2xl font-bold">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Mario Rossi</h2>
                <p className="text-primary font-mono text-sm uppercase">Platinum Client</p>
              </div>
            </div>
          </div>

          {/* FIX: Escaped entities per le note */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6">
            <div className="flex items-center gap-2 text-red-400 mb-4 font-bold uppercase text-xs tracking-widest">
              <ShieldAlert size={16} /> Note Tecniche Riservate
            </div>
            <p className="text-gray-300 text-sm leading-relaxed italic">
              &quot;Attenzione: il cliente lamenta spesso vibrazioni allo sterzo sopra i 120km/h. Utilizzare solo ricambi originali Brembo per l&apos;impianto frenante.&quot;
            </p>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-6">
            <div className="flex items-center gap-2 text-blue-400 mb-4 font-bold uppercase text-xs tracking-widest">
              <History size={16} /> Note Familiari
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              &quot;Amico di Giovanni. Preferisce essere contattato via WhatsApp. Non disponibile il mercoledì pomeriggio.&quot;
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="text-primary" /> Cronologia Interventi
            </h3>
            <div className="space-y-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="relative pl-8 border-l border-white/10 pb-6 last:pb-0">
                  {/* FIX: Tailwind Canonical Class -left-1.25 */}
                  <div className="absolute -left-1.25 top-0 w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_10px_rgba(234,88,12,0.5)]" />
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 uppercase font-bold tracking-tighter">15 Ottobre 2024</span>
                    <span className="text-primary font-mono font-bold">€ 450.00</span>
                  </div>
                  <h5 className="text-white font-semibold">Tagliando completo + Pastiglie freni</h5>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}