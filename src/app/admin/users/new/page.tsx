"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema } from "@/lib/schemas";
import type { CreateUserFormData } from "@/lib/schemas";
import { createUser } from "@/app/actions/users";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Role } from "@prisma/client";

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createUserSchema) as any,
    defaultValues: {
      role: "VIEWER",
      isActive: true,
    } as CreateUserFormData,
  });

  async function onSubmit(data: CreateUserFormData) {
    setLoading(true);
    setError("");

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const result = await createUser(formData);
    setLoading(false);

    if (result && !result.success) {
      setError(result.message || "Errore durante il salvataggio");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nuovo Utente</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Nome *</label>
          <input
            {...register("name")}
            placeholder="Nome e cognome"
            className="w-full border rounded px-3 py-2"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            {...register("email")}
            placeholder="email@esempio.com"
            className="w-full border rounded px-3 py-2"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password *</label>
          <input
            type="password"
            {...register("password")}
            placeholder="Minimo 8 caratteri"
            className="w-full border rounded px-3 py-2"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ruolo</label>
          <select
            {...register("role")}
            className="w-full border rounded px-3 py-2"
          >
            <option value="VIEWER">Visualizzatore</option>
            <option value="RECEPTIONIST">Receptionist</option>
            <option value="MECHANIC">Meccanico</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Amministratore</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            {...register("isActive")}
            className="mr-2"
            defaultChecked={true}
          />
          <label className="text-sm">Utente attivo</label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-foreground px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Salvataggio..." : "Crea Utente"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
}
