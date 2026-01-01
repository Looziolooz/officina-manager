"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, ArrowLeft, AlertCircle } from "lucide-react";
import { updateCustomerProfile } from "@/app/actions/customer";
import { customerEditSchema, type CustomerEditData } from "@/lib/schemas";
import type { Customer } from "@prisma/client"; // Importa il tipo corretto da Prisma

interface Props {
  customer: Customer; // Sostituito 'any' con il tipo reale
}

export default function EditCustomerForm({ customer }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CustomerEditData>({
    resolver: zodResolver(customerEditSchema),
    defaultValues: {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email || "",
      phone: customer.phone,
      alternatePhone: customer.alternatePhone || "",
      address: customer.address || "",
    }
  });

  const onSubmit = async (data: CustomerEditData) => {
    setServerError("");
    const res = await updateCustomerProfile(customer.id, data);
    
    if (res.success) {
      router.push(`/admin/customers/${customer.id}`);
      router.refresh();
    } else {
      setServerError(typeof res.error === 'string' ? res.error : "Errore validazione");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Modifica Anagrafica</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Nome</label>
          <input {...register("firstName")} className="w-full bg-black/20 border border-white/10 p-3 rounded-lg text-white" />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Cognome</label>
          <input {...register("lastName")} className="w-full bg-black/20 border border-white/10 p-3 rounded-lg text-white" />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Telefono</label>
          <input {...register("phone")} className="w-full bg-black/20 border border-white/10 p-3 rounded-lg text-white" />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Email</label>
          <input {...register("email")} className="w-full bg-black/20 border border-white/10 p-3 rounded-lg text-white" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Indirizzo</label>
        <textarea {...register("address")} rows={3} className="w-full bg-black/20 border border-white/10 p-3 rounded-lg text-white" />
      </div>

      {serverError && (
        <div className="p-4 bg-red-500/10 text-red-500 rounded-xl flex items-center gap-2">
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
          className="w-2/3 bg-primary hover:bg-orange-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isSubmitting ? "Salvataggio..." : <><Save size={18} /> Salva Modifiche</>}
        </button>
      </div>
    </form>
  );
}