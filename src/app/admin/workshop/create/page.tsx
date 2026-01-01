"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Wrench, Save, ArrowLeft, AlertCircle, Calendar, Clock, Gauge } from "lucide-react";
import { createJob } from "@/app/actions/workshop";

// Lista dei tipi di manutenzione (allineata con l'Enum Prisma)
const MAINTENANCE_TYPES = [
  { value: "OIL_CHANGE", label: "Cambio Olio" },
  { value: "BRAKE_SERVICE", label: "Freni" },
  { value: "TIRE_ROTATION", label: "Gommista" },
  { value: "GENERAL_INSPECTION", label: "Ispezione Generale" },
  { value: "ENGINE_REPAIR", label: "Motore" },
  { value: "TRANSMISSION", label: "Trasmissione" },
  { value: "ELECTRICAL", label: "Elettrico" },
  { value: "BODYWORK", label: "Carrozzeria" },
  { value: "OTHER", label: "Altro" },
];

export default function WorkshopCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Recupera l'ID veicolo dalla URL se presente (es: ?vehicleId=123)
  const preselectedVehicleId = searchParams.get("vehicleId") || "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    vehicleId: preselectedVehicleId,
    kmAtEntry: 0,
    scheduledDate: new Date().toISOString().split('T')[0], // Data di oggi YYYY-MM-DD
    priority: "0",
    estimatedDuration: 60,
    maintenanceType: "GENERAL_INSPECTION"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setIsSubmitting(true);

    // Preparazione payload con conversione tipi
    const payload = {
      title: formData.title,
      description: formData.description,
      vehicleId: formData.vehicleId, // Deve essere una stringa valida (ID veicolo)
      kmAtEntry: Number(formData.kmAtEntry),
      scheduledDate: new Date(formData.scheduledDate),
      priority: Number(formData.priority),
      estimatedDuration: Number(formData.estimatedDuration),
      maintenanceType: formData.maintenanceType
    };

    try {
      const res = await createJob(payload);

      if (res.success) {
        router.push("/admin/workshop");
        router.refresh();
      } else {
        const errorMsg = typeof res.error === 'string' 
          ? res.error 
          : "Errore durante il salvataggio. Controlla i dati.";
        setServerError(errorMsg);
      }
    } catch (error) {
      console.error(error);
      setServerError("Errore imprevisto del sistema.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Wrench className="text-orange-500 w-8 h-8" />
        <h1 className="text-3xl font-bold text-white">Nuovo Intervento</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10">
        
        {/* Sezione Veicolo e Titolo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">ID Veicolo *</label>
            <input 
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
              placeholder="Incolla ID Veicolo"
              className="w-full bg-black/20 border border-white/10 p-3 rounded-xl text-white focus:border-orange-500 outline-none transition-colors"
              required
            />
            <p className="text-[10px] text-gray-500 mt-1">
              {preselectedVehicleId ? "Preselezionato dalla scheda cliente" : "Inserisci l'ID del veicolo manualmente"}
            </p>
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Titolo Lavoro *</label>
            <input 
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Es. Tagliando Completo"
              className="w-full bg-black/20 border border-white/10 p-3 rounded-xl text-white focus:border-orange-500 outline-none transition-colors"
              required
            />
          </div>
        </div>

        {/* Sezione Dettagli Tecnici */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            {/* RIMOSSO 'block', mantenuto 'flex' per allineare l'icona */}
            <label className="text-xs text-gray-400 uppercase font-bold mb-2 flex items-center gap-2">
              <Gauge size={14} /> KM Ingresso
            </label>
            <input 
              type="number"
              name="kmAtEntry"
              value={formData.kmAtEntry}
              onChange={handleChange}
              className="w-full bg-black/20 border border-white/10 p-3 rounded-xl text-white focus:border-orange-500 outline-none"
              min="0"
              required
            />
          </div>

          <div>
            {/* RIMOSSO 'block', mantenuto 'flex' */}
            <label className="text-xs text-gray-400 uppercase font-bold mb-2 flex items-center gap-2">
              <Calendar size={14} /> Data Prevista
            </label>
            <input 
              type="date"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              className="w-full bg-black/20 border border-white/10 p-3 rounded-xl text-white focus:border-orange-500 outline-none"
              required
            />
          </div>

          <div>
            {/* RIMOSSO 'block', mantenuto 'flex' */}
            <label className="text-xs text-gray-400 uppercase font-bold mb-2 flex items-center gap-2">
              <Clock size={14} /> Durata (min)
            </label>
            <input 
              type="number"
              name="estimatedDuration"
              value={formData.estimatedDuration}
              onChange={handleChange}
              className="w-full bg-black/20 border border-white/10 p-3 rounded-xl text-white focus:border-orange-500 outline-none"
            />
          </div>
        </div>

        {/* Sezione Tipo e Priorità */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Tipo Intervento</label>
            <select 
              name="maintenanceType"
              value={formData.maintenanceType}
              onChange={handleChange}
              className="w-full bg-black/20 border border-white/10 p-3 rounded-xl text-white focus:border-orange-500 outline-none appearance-none"
            >
              {MAINTENANCE_TYPES.map((type) => (
                <option key={type.value} value={type.value} className="bg-slate-900 text-white">
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Priorità</label>
            <select 
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full bg-black/20 border border-white/10 p-3 rounded-xl text-white focus:border-orange-500 outline-none appearance-none"
            >
              <option value="0" className="bg-slate-900">Normale</option>
              <option value="1" className="bg-slate-900">Alta</option>
              <option value="2" className="bg-slate-900">Critica</option>
            </select>
          </div>
        </div>

        {/* Descrizione */}
        <div>
          <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Note / Descrizione</label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full bg-black/20 border border-white/10 p-3 rounded-xl text-white focus:border-orange-500 outline-none transition-colors"
          />
        </div>

        {/* Messaggio Errore */}
        {serverError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3 animate-pulse">
            <AlertCircle size={20} />
            <span className="font-medium">{serverError}</span>
          </div>
        )}

        {/* Pulsanti Azione */}
        <div className="flex gap-4 pt-4 border-t border-white/10">
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="w-1/3 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft size={18} /> Annulla
          </button>
          
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-2/3 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-900/20"
          >
            {isSubmitting ? (
              "Salvataggio..."
            ) : (
              <>
                <Save size={18} /> Crea Lavoro
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}