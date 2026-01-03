"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createJob, getVehiclesForSelect } from "@/app/actions/workshop"; 

// Schema locale per il form
const workshopCreateSchema = z.object({
  title: z.string().min(3, "Titolo richiesto"),
  description: z.string().optional(),
  vehicleId: z.string().min(1, "Seleziona un veicolo"),
  scheduledDate: z.string().min(1, "Data richiesta"),
  estimatedDuration: z.coerce.number().min(0).optional(),
  priority: z.coerce.number().int().min(0).max(2).default(0),
  kmAtEntry: z.coerce.number().int().min(0, "I Km non possono essere negativi"),
  fuelLevel: z.coerce.number().int().min(0).max(100).optional(),
  maintenanceType: z.string().optional(),
});

type WorkshopCreateData = z.infer<typeof workshopCreateSchema>;

// Tipo per i veicoli nella select
interface VehicleOption {
  id: string;
  plate: string;
  brand: string;
  model: string;
  owner: { firstName: string; lastName: string };
}

export default function CreateJobPage() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);

  useEffect(() => {
    const loadVehicles = async () => {
      const data = await getVehiclesForSelect();
      setVehicles(data);
    };
    loadVehicles();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(workshopCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      vehicleId: "",
      priority: 0,
      kmAtEntry: 0,
      fuelLevel: 50,
      estimatedDuration: 0,
    },
  });

  const onSubmit: SubmitHandler<WorkshopCreateData> = (data) => {
    setServerError(null);
    startTransition(async () => {
      const formData = new FormData();
      
      formData.append("title", data.title);
      if (data.description) formData.append("description", data.description);
      formData.append("vehicleId", data.vehicleId);
      formData.append("scheduledDate", data.scheduledDate);
      formData.append("kmAtEntry", data.kmAtEntry.toString());
      formData.append("priority", data.priority.toString());
      
      if (data.estimatedDuration) formData.append("estimatedDuration", data.estimatedDuration.toString());
      if (data.fuelLevel) formData.append("fuelLevel", data.fuelLevel.toString());
      if (data.maintenanceType) formData.append("maintenanceType", data.maintenanceType || "");

      const res = await createJob(formData);

      if (res && !res.success && res.message) {
         setServerError(typeof res.message === 'string' ? res.message : "Errore sconosciuto");
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/workshop"
          className="text-gray-400 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft size={20} /> Torna all&apos;Officina
        </Link>
        <h1 className="text-3xl font-bold text-white">Nuovo Lavoro</h1>
      </div>

      {serverError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
          <AlertCircle size={20} />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* SEZIONE 1: Dettagli Lavoro */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 pb-4 border-b border-white/10">
            Dettagli Intervento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Titolo Intervento *</label>
              <input
                {...register("title")}
                placeholder="Es. Tagliando Completo"
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message as string}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Descrizione</label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder="Dettagli aggiuntivi..."
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
              />
            </div>

            <div>
               <label className="block text-sm text-gray-400 mb-1">Veicolo *</label>
               <select
                 {...register("vehicleId")}
                 className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
               >
                 <option value="">Seleziona veicolo...</option>
                 {vehicles.map((v) => (
                   <option key={v.id} value={v.id}>
                     {v.plate} - {v.brand} {v.model} ({v.owner.lastName})
                   </option>
                 ))}
               </select>
               {errors.vehicleId && <p className="text-red-400 text-xs mt-1">{errors.vehicleId.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Tipo Manutenzione</label>
              <select
                {...register("maintenanceType")}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
              >
                <option value="">Altro / Generico</option>
                <option value="OIL_CHANGE">Cambio Olio</option>
                <option value="BRAKE_SERVICE">Freni</option>
                <option value="TIRE_ROTATION">Gomme</option>
                <option value="GENERAL_INSPECTION">Ispezione Generale</option>
                <option value="ENGINE_REPAIR">Motore</option>
                <option value="ELECTRICAL">Elettrico</option>
                <option value="BODYWORK">Carrozzeria</option>
              </select>
            </div>
            
            <div>
               <label className="block text-sm text-gray-400 mb-1">Data Programmata *</label>
               {/* FIX: Usato scheme-dark invece di [color-scheme:dark] */}
               <input
                 type="datetime-local"
                 {...register("scheduledDate")}
                 className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none scheme-dark"
               />
               {errors.scheduledDate && <p className="text-red-400 text-xs mt-1">{errors.scheduledDate.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Priorità</label>
              <select
                {...register("priority")}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
              >
                <option value="0">Bassa</option>
                <option value="1">Media</option>
                <option value="2">Alta</option>
              </select>
            </div>
          </div>
        </div>

        {/* SEZIONE 2: Stato Veicolo */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 pb-4 border-b border-white/10">
            Stato Veicolo all&apos;Ingresso
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm text-gray-400 mb-1">Km Attuali *</label>
               <input
                 type="number"
                 {...register("kmAtEntry")}
                 className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
               />
               {errors.kmAtEntry && <p className="text-red-400 text-xs mt-1">{errors.kmAtEntry.message as string}</p>}
             </div>

             <div>
               <label className="block text-sm text-gray-400 mb-1">Livello Carburante (%)</label>
               <input
                 type="number"
                 {...register("fuelLevel")}
                 className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
               />
             </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary hover:bg-orange-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Creazione..." : <><Save size={20} /> Crea Scheda Lavoro</>}
        </button>
      </form>
    </div>
  );
}