"use client";
import { motion } from "framer-motion";
import { Clock, Car, CheckCircle2, Wrench, Navigation } from "lucide-react";

const columns = [
  { id: "ACCETTAZIONE", label: "Accettazione", icon: <Clock className="text-blue-500" /> },
  { id: "IN_LAVORAZIONE", label: "In Lavorazione", icon: <Wrench className="text-orange-500" /> },
  { id: "TEST_SU_STRADA", label: "Test su Strada", icon: <Navigation className="text-yellow-500" /> },
  { id: "PRONTO", label: "Pronto / Lavaggio", icon: <CheckCircle2 className="text-green-500" /> },
];

// Dati fittizi per visualizzazione immediata
const jobs = [
  { id: "1", title: "Cambio Cinghia", plate: "AA123BB", model: "Golf 7", status: "IN_LAVORAZIONE" },
  { id: "2", title: "Diagnosi Spia ABS", plate: "CC444DD", model: "Audi A3", status: "ACCETTAZIONE" },
  { id: "3", title: "Tagliando", plate: "EE555FF", model: "Fiat 500", status: "PRONTO" },
];

export default function KanbanDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8 tracking-tighter">STATO OFFICINA LIVE</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((col) => (
          <div key={col.id} className="bg-slate-900/50 rounded-2xl border border-white/5 p-4 min-h-[70vh]">
            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
              {col.icon}
              <h2 className="text-white font-bold uppercase text-sm tracking-widest">{col.label}</h2>
              <span className="ml-auto bg-white/10 text-white text-xs px-2 py-0.5 rounded-full">
                {jobs.filter(j => j.status === col.id).length}
              </span>
            </div>

            <div className="space-y-4">
              {jobs.filter(j => j.status === col.id).map((job) => (
                <motion.div
                  layoutId={job.id}
                  key={job.id}
                  className="bg-white/5 border border-white/10 p-4 rounded-xl hover:border-primary/50 transition-all cursor-grab active:cursor-grabbing"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono bg-white text-black px-1.5 rounded font-bold">
                      {job.plate}
                    </span>
                    <Car size={14} className="text-gray-500" />
                  </div>
                  <h3 className="text-white font-semibold text-sm">{job.model}</h3>
                  <p className="text-gray-500 text-xs mt-1">{job.title}</p>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}