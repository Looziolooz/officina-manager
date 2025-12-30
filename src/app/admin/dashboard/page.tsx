"use client";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, Wrench, Navigation, Car } from "lucide-react";
import QuickInventory from "@/components/admin/QuickInventory";

const columns = [
  { id: "ACCETTAZIONE", label: "Entrata", icon: <Clock size={16} className="text-blue-500" /> },
  { id: "IN_LAVORAZIONE", label: "Ponte / Officina", icon: <Wrench size={16} className="text-orange-500" /> },
  { id: "TEST_SU_STRADA", label: "Collaudo", icon: <Navigation size={16} className="text-yellow-500" /> },
  { id: "PRONTO", label: "Pronto", icon: <CheckCircle2 size={16} className="text-green-500" /> },
];

// Esempio dati (verranno poi caricati dal DB con un'action)
const jobs = [
  { id: "clmq123", plate: "FS123GT", model: "Jeep Renegade", status: "IN_LAVORAZIONE", owner: "M. Rossi" },
  { id: "clmq456", plate: "GH456TT", model: "Audi A4", status: "ACCETTAZIONE", owner: "L. Bianchi" },
];

export default function KanbanDashboard() {
  return (
    <div className="min-h-screen bg-background p-6">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">Gestione Flusso Officina</h1>
        <p className="text-gray-500">Monitoraggio in tempo reale degli interventi e ricambi.</p>
      </header>

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
                  className="bg-white/5 border border-white/10 p-4 rounded-xl shadow-xl hover:bg-white/[0.07] transition-colors"
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

                  {/* POS INTEGRATO SOLO PER AUTO SUL PONTE */}
                  {col.id === "IN_LAVORAZIONE" && (
                    <div className="mt-4 border-t border-white/5 pt-4">
                      <QuickInventory jobId={job.id} />
                    </div>
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