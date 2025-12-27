"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Car, User, FileText, Wrench, Mail, Phone, Hash } from "lucide-react";

// Definiamo il tipo per il cliente per evitare l'errore "any"
interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function NewWorkshopJobPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    vehicleModel: "",
    licensePlate: "",
    jobType: "service",
    description: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const fullName = `${formData.firstName} ${formData.lastName}`;
    const newJobId = Date.now().toString();

    // 1. OGGETTO LAVORO (per la Kanban)
    const newJob = {
      id: newJobId, 
      status: "todo",
      customer: fullName,
      email: formData.email,
      phone: formData.phone,
      vehicle: formData.vehicleModel,
      plate: formData.licensePlate,
      type: formData.jobType,
      description: formData.description,
      createdAt: new Date().toISOString()
    };

    // 2. OGGETTO CLIENTE (per l'Anagrafica Clienti)
    const newCustomer: Customer = {
        id: Date.now().toString() + "_cust",
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        // vehicles e lastVisit possono essere aggiunti ma per l'interfaccia Customer base bastano i dati anagrafici
    };

    // A. Salva Lavoro
    const existingJobs = JSON.parse(localStorage.getItem("workshopJobs") || "[]");
    localStorage.setItem("workshopJobs", JSON.stringify([...existingJobs, newJob]));

    // B. Salva Cliente (Logica: "Se non esiste, aggiungilo")
    const existingCustomers = JSON.parse(localStorage.getItem("workshopCustomers") || "[]");
    
    // QUI ERA L'ERRORE: Ora specifichiamo che 'c' è di tipo Customer
    const customerExists = existingCustomers.find((c: Customer) => 
        (c.email === formData.email && c.email !== "") || 
        (c.lastName.toLowerCase() === formData.lastName.toLowerCase() && c.firstName.toLowerCase() === formData.firstName.toLowerCase())
    );

    if (!customerExists) {
        // Aggiungiamo vehicles e lastVisit solo nel salvataggio completo
        const customerToSave = {
            ...newCustomer,
            vehicles: [{ model: formData.vehicleModel, plate: formData.licensePlate }],
            lastVisit: new Date().toISOString()
        };
        localStorage.setItem("workshopCustomers", JSON.stringify([...existingCustomers, customerToSave]));
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setIsLoading(false);
    router.push("/admin/officina"); 
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/officina"
          className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Nuovo Lavoro</h1>
          <p className="text-slate-400">Inserisci i dati. Il cliente verrà salvato automaticamente in anagrafica.</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* --- DATI CLIENTE --- */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-2">Dati Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <User className="w-4 h-4 text-orange-500" /> Nome
                </label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  type="text"
                  required
                  placeholder="es. Mario"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <User className="w-4 h-4 text-orange-500" /> Cognome
                </label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  type="text"
                  required
                  placeholder="es. Rossi"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Mail className="w-4 h-4 text-orange-500" /> Email
                </label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="mario.rossi@email.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Phone className="w-4 h-4 text-orange-500" /> Telefono
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  type="tel"
                  placeholder="333 1234567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* --- DATI VEICOLO --- */}
          <div className="space-y-4 mt-8">
            <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-2">Dati Veicolo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Car className="w-4 h-4 text-orange-500" /> Modello Auto
                </label>
                <input
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  type="text"
                  required
                  placeholder="es. Fiat Panda 1.2"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Hash className="w-4 h-4 text-orange-500" /> Targa
                </label>
                <input
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  type="text"
                  required
                  placeholder="es. AB 123 CD"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors uppercase"
                />
              </div>
            </div>
          </div>

          {/* --- DETTAGLI LAVORO --- */}
          <div className="space-y-4 mt-8">
            <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-2">Dettagli Intervento</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Wrench className="w-4 h-4 text-orange-500" /> Tipo di lavoro
              </label>
              <select 
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none"
              >
                <option value="service">Tagliando</option>
                <option value="repair">Riparazione</option>
                <option value="inspection">Revisione</option>
                <option value="tire_change">Cambio Gomme</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <FileText className="w-4 h-4 text-orange-500" /> Descrizione Problema
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Descrivi il problema o il lavoro da svolgere..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors resize-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <Link
              href="/admin/officina"
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Annulla
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isLoading ? "Salvataggio..." : "Salva Lavoro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}