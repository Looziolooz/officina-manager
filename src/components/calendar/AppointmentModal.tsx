"use client";

import { useState } from "react";
import { X, Save, Trash2, Wrench, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Appointment } from "@prisma/client";

const appointmentFormSchema = z.object({
  startAt: z.string().min(1, "Data obbligatoria"),
  endAt: z.string().min(1, "Data obbligatoria"),
  type: z.enum(["DIAGNOSTIC", "SCHEDULED_WORK", "PICKUP", "OTHER"]),
  notes: z.string().optional(),
  customerId: z.string().optional(),
  vehicleId: z.string().optional(),
  walkInName: z.string().optional(),
  walkInPhone: z.string().optional(),
  walkInPlate: z.string().optional(),
});

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  onDelete?: () => void;
  onConvertToJob?: () => void;
  appointment?: Appointment | null;
  mode: "create" | "edit" | "view";
}

export default function AppointmentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  onConvertToJob,
  appointment, 
  mode 
}: AppointmentModalProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: appointment ? {
      startAt: new Date(appointment.startAt).toISOString().slice(0, 16),
      endAt: new Date(appointment.endAt).toISOString().slice(0, 16),
      type: appointment.type ?? "SCHEDULED_WORK",
      notes: appointment.notes || "",
      customerId: appointment.customerId || "",
      vehicleId: appointment.vehicleId || "",
      walkInName: appointment.walkInName || "",
      walkInPhone: appointment.walkInPhone || "",
      walkInPlate: appointment.walkInPlate || "",
    } : {
      startAt: new Date().toISOString().slice(0, 16),
      endAt: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
      type: "SCHEDULED_WORK",
      notes: "",
      customerId: "",
      vehicleId: "",
      walkInName: "",
      walkInPhone: "",
      walkInPlate: "",
    }
  });

  if (!isOpen) return null;

  const onSubmit = (data: any) => {
    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h3 className="text-foreground font-bold flex items-center gap-2">
            <Calendar className="text-primary" size={20} />
            {mode === "create" ? "Nuovo Appuntamento" : mode === "edit" ? "Modifica Appuntamento" : "Dettagli Appuntamento"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Data/Ora Inizio</label>
              <input 
                {...register("startAt")}
                type="datetime-local"
                disabled={mode === "view"}
                className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:border-primary outline-none disabled:opacity-50"
              />
              {errors.startAt && <p className="text-red-400 text-xs mt-1">{errors.startAt.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">Data/Ora Fine</label>
              <input 
                {...register("endAt")}
                type="datetime-local"
                disabled={mode === "view"}
                className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:border-primary outline-none disabled:opacity-50"
              />
              {errors.endAt && <p className="text-red-400 text-xs mt-1">{errors.endAt.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1">Tipo</label>
            <select 
              {...register("type")}
              disabled={mode === "view"}
              className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:border-primary outline-none disabled:opacity-50"
            >
              <option value="SCHEDULED_WORK">Lavoro programmato</option>
              <option value="DIAGNOSTIC">Diagnostica</option>
              <option value="PICKUP">Ritiro auto</option>
              <option value="OTHER">Altro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1">Note</label>
            <textarea 
              {...register("notes")}
              disabled={mode === "view"}
              rows={3}
              className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:border-primary outline-none resize-none disabled:opacity-50"
              placeholder="Note aggiuntive..."
            />
          </div>

          {/* Walk-in fields */}
          <div className="bg-background/50 p-4 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-3">Dati cliente (se non in anagrafica)</p>
            <div className="grid grid-cols-3 gap-3">
              <input 
                {...register("walkInName")}
                disabled={mode === "view"}
                placeholder="Nome cliente"
                className="bg-background border border-border rounded-lg p-3 text-foreground text-sm focus:border-primary outline-none disabled:opacity-50"
              />
              <input 
                {...register("walkInPhone")}
                disabled={mode === "view"}
                placeholder="Telefono"
                className="bg-background border border-border rounded-lg p-3 text-foreground text-sm focus:border-primary outline-none disabled:opacity-50"
              />
              <input 
                {...register("walkInPlate")}
                disabled={mode === "view"}
                placeholder="Targa"
                className="bg-background border border-border rounded-lg p-3 text-foreground text-sm focus:border-primary outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            {mode !== "view" && (
              <button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Save size={18} />
                Salva
              </button>
            )}
            
            {mode === "view" && onConvertToJob && (
              <button
                type="button"
                onClick={onConvertToJob}
                className="flex-1 bg-green-600 hover:bg-green-700 text-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Wrench size={18} />
                Avvia Lavoro
              </button>
            )}

            {mode !== "create" && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-6 bg-red-600 hover:bg-red-700 text-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Trash2 size={18} />
                Elimina
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
