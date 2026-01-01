"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createJob } from "@/app/actions/workshop"; // Assicurati che questo import esista
import { Save, ArrowLeft, AlertCircle } from "lucide-react";
import { Vehicle } from "@prisma/client";

// Definiamo manualmente i tipi per il form per semplicità, 
// idealmente dovrebbero matchare con Zod schema
type JobFormData = {
  title: string;
  description?: string;
  vehicleId: string;
  kmAtEntry: number;
  scheduledDate: string; // HTML input date usa string
  priority: string; // Select ritorna string, poi convertiamo
  maintenanceType?: string;
  estimatedDuration?: number;
};

interface Props {
  vehicles: Vehicle[]; // Passiamo i veicoli per la select
}

export default function JobCreateForm({ vehicles }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<JobFormData>();

  const onSubmit = async (data: JobFormData) => {
    setServerError("");
    
    // Adattiamo i dati per la Server Action (casting tipi)
    const payload = {
      ...data,
      kmAtEntry: Number(data.kmAtEntry),
      priority: Number(data.priority),
      estimatedDuration: data.estimatedDuration ? Number(data.estimatedDuration) : undefined,
      scheduledDate: new Date(data.scheduledDate),
    };

    const res = await createJob(payload);
    
    if (res.success) {
      router.push("/admin/workshop");
      router.refresh();
    } else {
      // Gestione errori Zod flatten o stringa generica
      const errorMsg = typeof res.error === 'string' 
        ? res.error 
        : "Controlla i campi inseriti (dati mancanti o non validi).";
      setServerError(errorMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10 max-w-2xl mx-auto">
      
      {/* Veicolo e Titolo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Veicolo *</label>
          <select 
            {...register("vehicleId", { required: "Seleziona un veicolo" })}
            className="w-full bg-black/20 border border-white/10 p-3 rounded-lg text-white"
          >
            <option value="">-- Seleziona --</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.plate} - {v.brand} {v.model}
              </option>
            ))}
          </select>
          {errors.vehicleId && <p className="text-red-500 text-xs mt-1">{errors.vehicleId.message}</p>}
        </div>

        <div>
          <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Titolo Lavoro *</label>
          <input 
            {...register("title", { required: "Titolo richiesto" })} 
            placeholder="Es. Tagliando Completo"
            className="w-full bg-black/20 border border-white/10 p-3 rounded-lg text-white" 
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>
      </div>

      {/* Dettagli Tecnici */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">KM Ingresso *</label>
          <input 
            type="number" 
            {...register("kmAtEntry", { required: "KM richiesti", min: 0 })}
            className="w-full bg-black/20 border border-white/10 p-3 rounded-lg text-white" 
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Data *</label>
          <input 
            type="date" 
            {...register("scheduledDate", { required: "Data richiesta" })}
            className="w-full bg-black/20 border border-white/10 p-3 rounded-lg text-white" 
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Priorità</label>
          <select {...register("priority")} className="w-full bg-black/20 border border-white/10 p-3 rounded-lg text-white">
            <option value="0">Normale</option>
            <option value="1">Alta</option>
            <option value="2">Critica</option>
          </select>
        </div>
         <div>
          <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Durata (min)</label>
          <input 
            type="number" 
            {...register("estimatedDuration")}
            placeholder="Es. 60"
            className="w-full bg-black/20 border border-white/10 p-3 rounded-lg text-white" 
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Descrizione</label>
        <textarea 
          {...register("description")} 
          rows={3} 
          className="w-full bg-black/20 border border-white/10 p-3 rounded-lg text-white" 
        />
      </div>

      {serverError && (
        <div className="p-4 bg-red-500/10 text-red-500 rounded-xl flex items-center gap-2 border border-red-500/20">
          <AlertCircle size={18} /> {serverError}
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <button 
          type="button" 
          onClick={() => router.back()} 
          className="w-1/3 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <ArrowLeft size={18} /> Annulla
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-2/3 bg-primary hover:bg-orange-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? "Salvataggio..." : <><Save size={18} /> Crea Lavoro</>}
        </button>
      </div>
    </form>
  );
}