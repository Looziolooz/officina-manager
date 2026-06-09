"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Car, Phone, Mail, FileText } from "lucide-react";

export default function CustomerForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      technicalNotes: formData.get("technicalNotes"),
      familyNotes: formData.get("familyNotes"),
      // Dati primo veicolo
      plate: formData.get("plate"),
      brand: formData.get("brand"),
      model: formData.get("model"),
      year: parseInt(formData.get("year") as string),
    };

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/admin/customers");
        router.refresh();
      }
    } catch (error) {
      console.error("Errore salvataggio:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* SEZIONE CLIENTE */}
      <div className="bg-white/5 p-6 rounded-xl border border-white/10">
        <div className="flex items-center gap-2 mb-6 text-primary">
          <User size={20} />
          <h2 className="text-xl font-semibold text-white">Dati Anagrafici</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="firstName" placeholder="Nome" required className="bg-background border-white/10 p-2 rounded-md text-white" />
          <input name="lastName" placeholder="Cognome" required className="bg-background border-white/10 p-2 rounded-md text-white" />
          <div className="relative">
            <Phone className="absolute left-2 top-3 text-gray-500" size={16} />
            <input name="phone" placeholder="Telefono" required className="pl-8 w-full bg-background border-white/10 p-2 rounded-md text-white" />
          </div>
          <div className="relative">
            <Mail className="absolute left-2 top-3 text-gray-500" size={16} />
            <input name="email" type="email" placeholder="Email (opzionale)" className="pl-8 w-full bg-background border-white/10 p-2 rounded-md text-white" />
          </div>
          <input name="address" placeholder="Indirizzo" className="md:col-span-2 bg-background border-white/10 p-2 rounded-md text-white" />
        </div>
      </div>

      {/* SEZIONE VEICOLO */}
      <div className="bg-white/5 p-6 rounded-xl border border-white/10">
        <div className="flex items-center gap-2 mb-6 text-green-400">
          <Car size={20} />
          <h2 className="text-xl font-semibold text-white">Primo Veicolo</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input name="plate" placeholder="Targa (es. AB123CD)" required className="uppercase bg-background border-white/10 p-2 rounded-md text-white" />
          <input name="brand" placeholder="Marca (es. Fiat)" required className="bg-background border-white/10 p-2 rounded-md text-white" />
          <input name="model" placeholder="Modello (es. Panda)" required className="bg-background border-white/10 p-2 rounded-md text-white" />
          <input name="year" type="number" placeholder="Anno" defaultValue={new Date().getFullYear()} className="bg-background border-white/10 p-2 rounded-md text-white" />
        </div>
      </div>

      {/* SEZIONE NOTE CRM AVANZATO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-blue-400 text-sm font-medium flex items-center gap-2">
            <FileText size={14} /> Note Tecniche (Meccanico)
          </label>
          <textarea name="technicalNotes" rows={3} className="w-full bg-blue-500/5 border-blue-500/20 p-2 rounded-md text-white placeholder:text-blue-300/30" placeholder="Specifiche olio, modifiche, difetti ricorrenti..." />
        </div>
        <div className="space-y-2">
          <label className="text-amber-400 text-sm font-medium flex items-center gap-2">
            <FileText size={14} /> Note Personali (Ufficio)
          </label>
          <textarea name="familyNotes" rows={3} className="w-full bg-amber-500/5 border-amber-500/20 p-2 rounded-md text-white placeholder:text-amber-300/30" placeholder="Preferenze orari, rapporti familiari, note pagamenti..." />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
      >
        {loading ? "Salvataggio in corso..." : "Registra Cliente e Veicolo"}
      </button>
    </form>
  );
}