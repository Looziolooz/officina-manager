"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Car, AlertCircle, Save } from "lucide-react";
import { createCustomerWithVehicle } from "@/app/actions/customer";
import { customerSchema, type CustomerFormData } from "@/lib/schemas";
import { useState, useTransition } from "react";
import Link from "next/link";

export default function NewCustomerPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // FIX: Rimosso <CustomerFormData> generico per lasciare che il resolver inferisca i tipi corretti
  // (questo risolve il conflitto con z.coerce.number)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: "", 
      lastName: "", 
      phone: "", 
      email: "",
      plate: "", 
      brand: "", 
      model: "",
      year: new Date().getFullYear(),
      technicalNotes: "", 
      familyNotes: "", 
      vin: "", 
      fuelType: "Diesel",
      address: "",
      alternatePhone: "",
      companyName: "",
      vatNumber: "",
      fiscalCode: "",
      city: "",
      postalCode: "",
      province: "",
      pec: "",
      sdiCode: "",
      engineSize: ""
    }
  });

  // FIX: Tipizziamo esplicitamente l'handler
  const onSubmit: SubmitHandler<CustomerFormData> = (data) => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString());
        }
      });

      const result = await createCustomerWithVehicle(formData);

      if (result && !result.success && result.message) {
        setError(typeof result.message === 'string' ? result.message : "Errore durante il salvataggio");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/customers" className="text-gray-400 hover:text-white">
           ← Torna indietro
        </Link>
        <h1 className="text-3xl font-bold text-white">Nuovo Cliente</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* SEZIONE 1: CLIENTE */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <User className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-white">Anagrafica Cliente</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nome *</label>
              <input {...register("firstName")} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" placeholder="Mario" />
              {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Cognome *</label>
              <input {...register("lastName")} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" placeholder="Rossi" />
              {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Telefono *</label>
              <input {...register("phone")} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" placeholder="+39 333..." />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input {...register("email")} type="email" className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" placeholder="mario@email.com" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message as string}</p>}
            </div>
          </div>
          
          <div className="mt-4">
             <label className="block text-sm text-gray-400 mb-1">Note Tecniche (Opzionale)</label>
             <textarea {...register("technicalNotes")} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" rows={2} placeholder="Es. Preferisce ricambi originali..." />
          </div>
        </div>

        {/* SEZIONE 2: VEICOLO */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <Car className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-white">Dati Veicolo</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Targa *</label>
              <input {...register("plate")} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white uppercase font-mono focus:border-primary outline-none" placeholder="AB123CD" />
              {errors.plate && <p className="text-red-400 text-xs mt-1">{errors.plate.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Marca *</label>
              <input {...register("brand")} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" placeholder="Fiat" />
              {errors.brand && <p className="text-red-400 text-xs mt-1">{errors.brand.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Modello *</label>
              <input {...register("model")} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" placeholder="Panda" />
              {errors.model && <p className="text-red-400 text-xs mt-1">{errors.model.message as string}</p>}
            </div>
            <div>
               <label className="block text-sm text-gray-400 mb-1">Anno</label>
               <input {...register("year")} type="number" className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" />
            </div>
            <div>
               <label className="block text-sm text-gray-400 mb-1">Alimentazione</label>
               <select {...register("fuelType")} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none">
                  <option value="Diesel">Diesel</option>
                  <option value="Benzina">Benzina</option>
                  <option value="Ibrida">Ibrida</option>
                  <option value="Elettrica">Elettrica</option>
                  <option value="GPL">GPL</option>
                  <option value="Metano">Metano</option>
               </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary hover:bg-orange-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            "Salvataggio in corso..."
          ) : (
            <>
              <Save size={20} /> Salva Cliente e Veicolo
            </>
          )}
        </button>
      </form>
    </div>
  );
}