"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler, SubmitErrorHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Car, CheckCircle, AlertCircle } from "lucide-react";
import { createCustomerWithVehicle } from "@/app/actions/customer";
import { customerSchema, type CustomerFormData } from "@/lib/schemas";

export default function NewCustomerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState("");
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema) as unknown as Resolver<CustomerFormData>,
    defaultValues: {
      firstName: "", lastName: "", phone: "", email: "", address: "",
      plate: "", brand: "", model: "", 
      year: new Date().getFullYear(),
      technicalNotes: "", familyNotes: "", vin: "", fuelType: "Diesel"
    }
  });

  const onSubmit: SubmitHandler<CustomerFormData> = async (data) => {
    setServerError(""); // Resetta errori precedenti
    const res = await createCustomerWithVehicle(data);
    if (res.success) {
      router.push(`/admin/customers/${res.customerId}`);
    } else {
      // Mostra l'errore specifico restituito dal server (es. "Targa già esistente")
      setServerError(typeof res.error === 'string' ? res.error : "Errore validazione server");
    }
  };

  const onError: SubmitErrorHandler<CustomerFormData> = (errs) => {
    console.error("Validazione fallita:", errs);
  };

  // Mappa dei nomi dei campi per messaggi più leggibili
  const fieldLabels: Record<string, string> = {
    firstName: "Nome", lastName: "Cognome", phone: "Telefono", email: "Email",
    plate: "Targa", brand: "Marca", model: "Modello", year: "Anno"
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Registrazione Cliente</h1>
      
      <div className="flex justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -z-10" />
        {[1, 2, 3].map((s) => (
          <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-all cursor-pointer ${
            step >= s ? "bg-primary border-slate-950 text-white" : "bg-slate-900 border-white/10 text-gray-500"
          }`} onClick={() => setStep(s)}>
            {s}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10" noValidate>
        
        {/* STEP 1: ANAGRAFICA */}
        <div className={step === 1 ? "block space-y-4" : "hidden"}>
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><User /> Anagrafica</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input {...register("firstName")} placeholder="Nome *" className={`w-full bg-black/20 border p-3 rounded-lg text-white ${errors.firstName ? 'border-red-500' : 'border-white/10'}`} />
              </div>
              <div>
                <input {...register("lastName")} placeholder="Cognome *" className={`w-full bg-black/20 border p-3 rounded-lg text-white ${errors.lastName ? 'border-red-500' : 'border-white/10'}`} />
              </div>
            </div>
            <div>
              <input {...register("phone")} placeholder="Telefono *" className={`w-full bg-black/20 border p-3 rounded-lg text-white ${errors.phone ? 'border-red-500' : 'border-white/10'}`} />
            </div>
            <input {...register("email")} placeholder="Email" className={`w-full bg-black/20 border p-3 rounded-lg text-white ${errors.email ? 'border-red-500' : 'border-white/10'}`} />
            <textarea {...register("address")} placeholder="Indirizzo" className="w-full bg-black/20 border border-white/10 p-3 rounded-lg text-white min-h-20" />
            
            <button type="button" onClick={() => setStep(2)} className="w-full bg-primary hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-all cursor-pointer">Avanti</button>
        </div>

        {/* STEP 2: VEICOLO */}
        <div className={step === 2 ? "block space-y-4" : "hidden"}>
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Car /> Veicolo</h2>
            <div>
              <input {...register("plate")} placeholder="Targa (AA123BB) *" className={`w-full bg-black/20 border p-3 rounded-lg text-white uppercase font-mono text-lg ${errors.plate ? 'border-red-500' : 'border-white/10'}`} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input {...register("brand")} placeholder="Marca *" className={`w-full bg-black/20 border p-3 rounded-lg text-white ${errors.brand ? 'border-red-500' : 'border-white/10'}`} />
              </div>
              <div>
                <input {...register("model")} placeholder="Modello *" className={`w-full bg-black/20 border p-3 rounded-lg text-white ${errors.model ? 'border-red-500' : 'border-white/10'}`} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input {...register("year")} type="number" placeholder="Anno *" className={`w-full bg-black/20 border p-3 rounded-lg text-white ${errors.year ? 'border-red-500' : 'border-white/10'}`} />
              </div>
              <select {...register("fuelType")} className="w-full bg-black/20 border border-white/10 p-3 rounded-lg text-white">
                <option value="Diesel">Diesel</option>
                <option value="Benzina">Benzina</option>
                <option value="Ibrido">Ibrido</option>
                <option value="Elettrico">Elettrico</option>
              </select>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => setStep(1)} className="w-1/2 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg transition-all cursor-pointer">Indietro</button>
              <button type="button" onClick={() => setStep(3)} className="w-1/2 bg-primary hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-all cursor-pointer">Avanti</button>
            </div>
        </div>

        {/* STEP 3: RIEPILOGO E SALVATAGGIO */}
        <div className={step === 3 ? "block space-y-6" : "hidden"}>
            <h2 className="text-xl font-bold text-white">Conferma Dati</h2>
            
            {/* Box Errori Dinamico */}
            {(Object.keys(errors).length > 0 || serverError) && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex flex-col gap-2 animate-pulse">
                <div className="flex items-center gap-2 font-bold text-red-500">
                   <AlertCircle size={20} /> Attenzione:
                </div>
                {serverError && <p className="text-white font-bold">{serverError}</p>}
                
                {Object.keys(errors).length > 0 && (
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {Object.entries(errors).map(([key, error]) => (
                      <li key={key}>
                        <span className="font-bold">{fieldLabels[key] || key}:</span> {error?.message as string}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs mt-2 text-red-300">Torna indietro per correggere i campi evidenziati.</p>
              </div>
            )}

            {!Object.keys(errors).length && !serverError && (
               <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl flex items-center gap-2">
                  <CheckCircle size={20} /> Tutto pronto per il salvataggio.
               </div>
            )}

            <div className="flex gap-4">
              <button type="button" onClick={() => setStep(2)} className="w-1/2 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg transition-all cursor-pointer">Indietro</button>
              
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-1/2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Salvataggio..." : "Salva Tutto"}
              </button>
            </div>
        </div>
      </form>
    </div>
  );
}