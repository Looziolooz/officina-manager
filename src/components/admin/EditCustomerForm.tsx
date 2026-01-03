"use client";

import { useState, useTransition } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, ArrowLeft, AlertCircle } from "lucide-react";
import { updateCustomerProfile } from "@/app/actions/customer";
import { customerEditSchema, type CustomerEditData } from "@/lib/schemas";
import type { Customer } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface EditCustomerFormProps {
  customer: Customer;
}

export default function EditCustomerForm({ customer }: EditCustomerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerEditData>({
    resolver: zodResolver(customerEditSchema),
    defaultValues: {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email || "",
      phone: customer.phone,
      alternatePhone: customer.alternatePhone || "",
      address: customer.address || "",
      companyName: customer.companyName || "",
      vatNumber: customer.vatNumber || "",
      fiscalCode: customer.fiscalCode || "",
      city: customer.city || "",
      postalCode: customer.postalCode || "",
      province: customer.province || "",
      pec: customer.pec || "",
      sdiCode: customer.sdiCode || "",
      technicalNotes: customer.technicalNotes || "",
      familyNotes: customer.familyNotes || "",
    },
  });

  const onSubmit: SubmitHandler<CustomerEditData> = (data) => {
    setServerError(null);
    startTransition(async () => {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString());
        }
      });

      const res = await updateCustomerProfile(customer.id, formData);

      if (res && !res.success && res.message) {
        setServerError(res.message);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/admin/customers/${customer.id}`}
          className="text-gray-400 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft size={20} /> Torna al Profilo
        </Link>
        <h1 className="text-3xl font-bold text-white">Modifica Cliente</h1>
      </div>

      {serverError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
          <AlertCircle size={20} />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* SEZIONE 1: DATI ANAGRAFICI */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 pb-4 border-b border-white/10">
            Dati Anagrafici
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nome *</label>
              <input
                {...register("firstName")}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
              />
              {errors.firstName && (
                <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Cognome *</label>
              <input
                {...register("lastName")}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
              />
              {errors.lastName && (
                <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Telefono *</label>
              <input
                {...register("phone")}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
              />
              {errors.phone && (
                <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                {...register("email")}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Indirizzo</label>
              <input
                {...register("address")}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>

        {/* SEZIONE 2: DATI FISCALI */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 pb-4 border-b border-white/10">
            Dati Fiscali (Opzionali)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Ragione Sociale</label>
              <input
                {...register("companyName")}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Partita IVA</label>
              <input
                {...register("vatNumber")}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Codice Fiscale</label>
              <input
                {...register("fiscalCode")}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Codice Univoco (SDI)</label>
              <input
                {...register("sdiCode")}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">PEC</label>
              <input
                {...register("pec")}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Città</label>
              <input
                {...register("city")}
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
          {isPending ? "Salvataggio..." : <><Save size={20} /> Salva Modifiche</>}
        </button>
      </form>
    </div>
  );
}