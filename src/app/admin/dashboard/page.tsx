"use client";
import { motion } from "framer-motion";
import { 
  Clock, 
  CheckCircle2, 
  Wrench, 
  Navigation, 
  Car, 
  MessageCircle,
  TrendingUp,
  Package,
  CheckSquare
} from "lucide-react";
import QuickInventory from "@/components/admin/QuickInventory";
import { sendWhatsAppNotification } from "@/app/actions/notifications";

// Definizione colonne e stati
const columns = [
  { id: "ACCETTAZIONE", label: "Entrata", icon: <Clock size={16} className="text-blue-500" /> },
  { id: "IN_LAVORAZIONE", label: "Ponte / Officina", icon: <Wrench size={16} className="text-orange-500" /> },
  { id: "TEST_SU_STRADA", label: "Collaudo", icon: <Navigation size={16} className="text-yellow-500" /> },
  { id: "PRONTO", label: "Pronto", icon: <CheckCircle2 size={16} className="text-green-500" /> },
];

// Dati mockati (da collegare a database via Server Action in futuro)
const jobs = [
  { id: "clmq1", plate: "FS123GT", model: "Jeep Renegade", status: "IN_LAVORAZIONE", owner: "M. Rossi", phone: "3331122334" },
  { id: "clmq2", plate: "GH456TT", model: "Audi A4", status: "PRONTO", owner: "L. Bianchi", phone: "3409988776" },
  { id: "clmq3", plate: "BN998RR", model: "Fiat 500", status: "ACCETTAZIONE", owner: "A. Verdi", phone: "3285566443" },
];

const dailyStats = {
  revenue: 1250.00,
  partsUsed: 8,
  jobsDone: 4
};

export default function KanbanDashboard() {
  return (
    <div className="min-h-screen bg-background p-6 lg:p-10">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">Gestione Flusso Officina</h1>
        <p className="text-gray-500">Monitoraggio in tempo reale degli interventi e ricambi.</p>
      </header>

      {/* SEZIONE STATISTICHE GIORNALIERE - VERSIONA CANONICA */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
  {/* Incasso */}
  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
    <div className="absolute -right-2.5 -bottom-2.5 opacity-10 group-hover:scale-110 transition-transform">
      <TrendingUp size={80} className="text-green-500" />
    </div>
    <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Incasso Oggi</div>
    <div className="text-3xl font-bold text-green-500">€ {dailyStats.revenue.toFixed(2)}</div>
  </div>

  {/* Ricambi */}
  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
    <div className="absolute -right-2.5 -bottom-2.5 opacity-10 group-hover:scale-110 transition-transform">
      <Package size={80} className="text-blue-500" />
    </div>
    <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Ricambi Scaricati</div>
    <div className="text-3xl font-bold text-blue-500">{dailyStats.partsUsed} <span className="text-sm">pz</span></div>
  </div>

  {/* Consegnate */}
  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
    <div className="absolute -right-2.5 -bottom-2.5 opacity-10 group-hover:scale-110 transition-transform">
      <CheckSquare size={80} className="text-primary" />
    </div>
    <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Auto Consegnate</div>
    <div className="text-3xl font-bold text-primary">{dailyStats.jobsDone}</div>
  </div>
</div>

      {/* KANBAN BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {columns.map((col) => (
          <div key={col.id} className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-2">
              {col.icon}
              <h2 className="text-white font-bold text-xs uppercase tracking-widest">{col.label}</h2>
              <span className="ml-auto text-[10px] bg-white/5 text-gray-500 px-2 py-0.5 rounded-full border border-white/10">
                {jobs.filter(j => j.status === col.id).length}
              </span>
            </div>

            <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-3 min-h-[60vh] space-y-4">
              {jobs.filter(j => j.status === col.id).map((job) => (
                <motion.div
                  key={job.id}
                  layoutId={job.id}
                  className="bg-white/5 border border-white/10 p-4 rounded-xl shadow-xl hover:bg-white/[0.07] transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[9px] font-mono bg-primary text-white px-1.5 py-0.5 rounded font-bold">
                        {job.plate}
                      </span>
                      <h3 className="text-white font-bold text-sm mt-1">{job.model}</h3>
                      <p className="text-[10px] text-gray-500">{job.owner}</p>
                    </div>
                    <Car size={16} className="text-gray-700" />
                  </div>

                  {/* POS INTEGRATO PER AUTO SUL PONTE */}
                  {col.id === "IN_LAVORAZIONE" && (
                    <div className="mt-4 border-t border-white/5 pt-4">
                      <QuickInventory jobId={job.id} />
                    </div>
                  )}

                  {/* TASTO WHATSAPP PER AUTO PRONTE */}
                  {col.id === "PRONTO" && (
                    <button 
                      onClick={async () => {
                        const url = await sendWhatsAppNotification(job.phone, job.owner, job.model);
                        window.open(url, "_blank");
                      }}
                      className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
                    >
                      <MessageCircle size={14} /> AVVISA CLIENTE
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}