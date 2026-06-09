"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserSchema } from "@/lib/schemas";
import type { UpdateUserFormData } from "@/lib/schemas";
import { updateUser, changeUserPassword, toggle2FA, getUserById } from "@/app/actions/users";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Role } from "@prisma/client";

export default function EditUserPage() {
  const params = useParams();
  const userId = params.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(updateUserSchema) as any,
    defaultValues: {
      id: userId,
      role: "VIEWER",
      isActive: true,
    } as UpdateUserFormData,
  });

  useEffect(() => {
    loadUser();
  }, [userId]);

  async function loadUser() {
    const data = await getUserById(userId);
    if (data) {
      setUser(data);
      reset({
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role || "VIEWER",
        isActive: data.isActive ?? true,
      });
    }
  }

  async function onSubmit(data: UpdateUserFormData) {
    setLoading(true);
    setError("");

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const result = await updateUser(formData);
    setLoading(false);

    if (result && !result.success) {
      setError(result.message || "Errore durante il salvataggio");
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setError("La password deve essere almeno 8 caratteri");
      return;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("newPassword", newPassword);

    const result = await changeUserPassword(formData);
    if (result.success) {
      alert("Password aggiornata con successo");
      setShowPasswordForm(false);
      setNewPassword("");
    } else {
      setError(result.message || "Errore cambio password");
    }
  }

  async function handleToggle2FA() {
    if (!user) return;
    const result = await toggle2FA(userId, !user.twoFactorEnabled);
    if (result.success) {
      loadUser();
    }
  }

  if (!user) {
    return <div className="p-8">Caricamento...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Modifica Utente</h1>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Indietro
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <input type="hidden" {...register("id")} />

        <div>
          <label className="block text-sm font-medium mb-1">Nome *</label>
          <input
            {...register("name")}
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
            className="w-full border rounded px-3 py-2"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
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
          />
          <label className="text-sm">Utente attivo</label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Salvataggio..." : "Salva Modifiche"}
          </button>
        </div>
      </form>

      {/* Password Section */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Cambia Password</h3>
        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            Cambia Password
          </button>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Nuova Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border rounded px-3 py-2"
                minLength={8}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Salva Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setNewPassword("");
                }}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Annulla
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2FA Section */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Autenticazione a Due Fattori (2FA)</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Stato: {user.twoFactorEnabled ? "Attivo" : "Disattivo"}
            </p>
          </div>
          <button
            onClick={handleToggle2FA}
            className={`px-4 py-2 rounded ${
              user.twoFactorEnabled
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {user.twoFactorEnabled ? "Disattiva 2FA" : "Attiva 2FA"}
          </button>
        </div>
      </div>
    </div>
  );
}
