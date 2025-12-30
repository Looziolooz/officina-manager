"use client";
import { use } from "react";
import { motion } from "framer-motion";
import { 
  Car, 
  FileText, 
  User, 
  Plus, 
  History, 
  ShieldAlert,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header con Navigazione */}
      <div className="mb-8 flex items-center justify-between">
        <Link href="/admin/customers" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft size={20} /> Torna alla lista
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
        
        {/* COLONNA SINISTRA: Info & Note */}
        <div className="lg:col-span-1 space-y-6">
          {/* Info Card */}
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
            <div className="space-y-3 text-sm border-t border-white/5 pt-4">
              <p className="flex justify-between text-gray-400"><span>Email:</span> <span className="text-white">mario@email.it</span></p>
              <p className="flex justify-between text-gray-400"><span>Tel:</span> <span className="text-white">+39 333 112 2334</span></p>
              <p className="flex justify-between text-gray-400"><span>P.IVA/CF:</span> <span className="text-white">RSSMRA80...</span></p>
            </div>
          </div>

          {/* Note Tecniche (Priorità Alta per Meccanici) */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6">
            <div className="flex items-center gap-2 text-red-400 mb-4 font-bold uppercase text-xs tracking-widest">
              <ShieldAlert size={16} /> Note Tecniche Riservate
            </div>
            <p className="text-gray-300 text-sm leading-relaxed italic">
              "Attenzione: il cliente lamenta spesso vibrazioni allo sterzo sopra i 120km/h. Utilizzare solo ricambi originali Brembo per l'impianto frenante."
            </p>
          </div>

          {/* Note Familiari/CRM */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-6">
            <div className="flex items-center gap-2 text-blue-400 mb-4 font-bold uppercase text-xs tracking-widest">
              <History size={16} /> Note Familiari
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              "Amico di Giovanni. Preferisce essere contattato via WhatsApp. Non disponibile il mercoledì pomeriggio."
            </p>
          </div>
        </div>

        {/* COLONNA DESTRA: Veicoli & Storico */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Griglia Veicoli */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Car className="text-primary" /> Parco Veicoli
              </h3>
              <button className="text-primary hover:text-orange-400 text-sm font-bold flex items-center gap-1 transition-colors">
                <Plus size={16} /> Aggiungi Veicolo
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-primary/50 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-white text-black px-2 py-1 rounded font-mono font-bold text-sm shadow-inner">
                      AA 123 BB
                    </div>
                    <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full font-bold uppercase">In Officina</span>
                  </div>
                  <h4 className="text-white font-bold text-lg">Audi A3 Sportback</h4>
                  <p className="text-gray-500 text-sm">2.0 TDI - Anno 2021</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Timeline Interventi (Placeholder) */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="text-primary" /> Cronologia Interventi
            </h3>
            <div className="space-y-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="relative pl-8 border-l border-white/10 pb-6 last:pb-0">
                  <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_10px_rgba(234,88,12,0.5)]" />
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 uppercase font-bold tracking-tighter">15 Ottobre 2024</span>
                    <span className="text-primary font-mono font-bold">€ 450.00</span>
                  </div>
                  <h5 className="text-white font-semibold">Tagliando completo + Pastiglie freni</h5>
                  <p className="text-gray-500 text-sm mt-1">KM: 85.000 - Meccanico: Giovanni T.</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}