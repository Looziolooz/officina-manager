import { getJobs, createJob, updateJobStatus } from "@/app/actions/workshop";
import { JOB_STATUS } from "@/lib/constants"; // Import corretto
import { Car, Clock, CheckCircle2, AlertCircle, PlayCircle, Wrench, Package } from "lucide-react";
import Link from "next/link";

// Tipo manuale per aiutare TypeScript nel frontend
type JobWithDetails = {
  id: string;
  status: string;
  description: string;
  startDate: Date;
  vehicle: {
    plate: string;
    model: string;
    customer: {
      firstName: string;
      phone: string;
    }
  }
};

// Configurazione colori e label
const statusConfig: Record<string, { label: string; color: string }> = {
  [JOB_STATUS.PENDING]: { label: "In Attesa", color: "bg-slate-700 text-slate-300 border-slate-600" },
  [JOB_STATUS.IN_PROGRESS]: { label: "In Lavorazione", color: "bg-blue-900/30 text-blue-400 border-blue-800" },
  [JOB_STATUS.WAITING_PARTS]: { label: "Attesa Ricambi", color: "bg-orange-900/30 text-orange-400 border-orange-800" },
  [JOB_STATUS.COMPLETED]: { label: "Completato", color: "bg-green-900/30 text-green-400 border-green-800" },
  [JOB_STATUS.DELIVERED]: { label: "Consegnato", color: "bg-slate-900 text-slate-500" }
};

export default async function OfficinaPage() {
  const result = await getJobs();
  const jobs = result.success && result.data ? (result.data as unknown as JobWithDetails[]) : [];

  return (
    <div className="space-y-8">
      
      {/* FORM NUOVO INGRESSO */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Car className="text-orange-500" />
          Nuovo Ingresso Veicolo
        </h2>
        
        <form 
          action={async (formData) => {
            "use server";
            await createJob(formData);
          }} 
          className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end"
        >
          {/* RIGA 1: DATI VEICOLO */}
          <div className="md:col-span-2">
            <label className="text-xs text-slate-400 ml-1">Targa</label>
            <input name="plate" required placeholder="AA000BB" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white uppercase font-mono tracking-widest focus:border-orange-500 outline-none transition-colors" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-slate-400 ml-1">Modello</label>
            <input name="model" required placeholder="Es. Fiat Panda" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-orange-500 transition-colors" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-slate-400 ml-1">Km Attuali</label>
            <input type="number" name="km" required placeholder="150000" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-orange-500 transition-colors" />
          </div>

          {/* RIGA 2: DATI CLIENTE */}
          <div className="md:col-span-2">
            <label className="text-xs text-slate-400 ml-1">Nome</label>
            <input name="firstName" required placeholder="Mario" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-orange-500 transition-colors" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-slate-400 ml-1">Cognome</label>
            <input name="lastName" required placeholder="Rossi" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-orange-500 transition-colors" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-slate-400 ml-1">Telefono</label>
            <input name="phone" required placeholder="340..." className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-orange-500 transition-colors" />
          </div>
          
          {/* RIGA 3: DESCRIZIONE E BOTTONE */}
          <div className="md:col-span-5">
             <label className="text-xs text-slate-400 ml-1">Descrizione Problema / Lavori da fare</label>
             <input name="description" required placeholder="Es. Tagliando completo, rumore freni..." className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-orange-500 transition-colors" />
          </div>
          
          <div className="md:col-span-1">
            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-orange-900/20 active:scale-95 flex items-center justify-center gap-2">
              <Wrench className="w-4 h-4" />
              Accetta
            </button>
          </div>
        </form>
      </div>

      {/* LISTA LAVORI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => {
          const statusStyle = statusConfig[job.status] || statusConfig[JOB_STATUS.PENDING];
          
          return (
            <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg hover:border-slate-600 transition-all group">
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Link href={`/admin/officina/${job.id}`} className="hover:underline decoration-orange-500 underline-offset-4">
                    <h4 className="text-2xl font-mono font-bold text-white tracking-wider group-hover:text-orange-500 transition-colors">
                      {job.vehicle.plate}
                    </h4>
                  </Link>
                  <p className="text-sm text-slate-400">{job.vehicle.model}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyle.color}`}>
                  {statusStyle.label}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-300 leading-tight">{job.description}</p>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(job.startDate).toLocaleDateString('it-IT')}</span>
                </div>
                
                <p className="text-xs font-medium text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
                  👤 {job.vehicle.customer.firstName} • 📞 {job.vehicle.customer.phone}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-800 pt-4">
                {/* STATUS: PENDING -> IN PROGRESS */}
                {job.status === JOB_STATUS.PENDING && (
                  <form action={async () => { "use server"; await updateJobStatus(job.id, JOB_STATUS.IN_PROGRESS); }} className="col-span-2">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2.5 rounded font-medium flex items-center justify-center gap-2 transition-colors">
                      <PlayCircle className="w-4 h-4" /> Inizia Lavoro
                    </button>
                  </form>
                )}
                
                {/* STATUS: IN PROGRESS -> PEZZI o FINITO */}
                {job.status === JOB_STATUS.IN_PROGRESS && (
                  <>
                    <form action={async () => { "use server"; await updateJobStatus(job.id, JOB_STATUS.WAITING_PARTS); }}>
                      <button className="w-full bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 text-sm py-2.5 rounded font-medium flex items-center justify-center gap-2 transition-colors">
                        <Package className="w-4 h-4" /> Pezzi
                      </button>
                    </form>
                    <form action={async () => { "use server"; await updateJobStatus(job.id, JOB_STATUS.COMPLETED); }}>
                      <button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2.5 rounded font-medium flex items-center justify-center gap-2 transition-colors">
                        <CheckCircle2 className="w-4 h-4" /> Finito
                      </button>
                    </form>
                  </>
                )}

                {/* STATUS: PEZZI -> IN PROGRESS */}
                {job.status === JOB_STATUS.WAITING_PARTS && (
                   <form action={async () => { "use server"; await updateJobStatus(job.id, JOB_STATUS.IN_PROGRESS); }} className="col-span-2">
                   <button className="w-full bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 text-sm py-2.5 rounded font-medium flex items-center justify-center gap-2 transition-colors">
                     <PlayCircle className="w-4 h-4" /> Riprendi Lavoro
                   </button>
                 </form>
                )}

                {/* STATUS: COMPLETED -> DELIVERED */}
                {job.status === JOB_STATUS.COMPLETED && (
                  <form action={async () => { "use server"; await updateJobStatus(job.id, JOB_STATUS.DELIVERED); }} className="col-span-2">
                    <button className="w-full bg-slate-700 hover:bg-slate-600 text-white text-sm py-2.5 rounded font-medium flex items-center justify-center gap-2 transition-colors">
                      <CheckCircle2 className="w-4 h-4" /> Consegna e Archivia
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}