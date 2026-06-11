"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Car,
  Wrench,
  Check,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { getAvailableSlots, createPublicBooking } from "@/app/actions/booking";

type Slot = { startISO: string; label: string };

const SERVICES = [
  "Tagliando",
  "Diagnosi computerizzata",
  "Revisione / Check-up",
  "Ricarica climatizzatore",
  "Cambio automatico",
  "Altro",
];

export default function PrenotaPage() {
  const todayStr = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plate, setPlate] = useState("");
  const [service, setService] = useState(SERVICES[0]);
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleDateChange(value: string) {
    setDate(value);
    setSelected(null);
    setSlots([]);
    setSlotsLoaded(false);
    if (!value) return;
    setLoadingSlots(true);
    try {
      const s = await getAvailableSlots(`${value}T12:00:00`);
      setSlots(s);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
      setSlotsLoaded(true);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await createPublicBooking({ name, phone, plate, service, notes, startISO: selected });
      if (res.success) {
        setDone(true);
      } else {
        setError(res.message);
        // se lo slot è stato preso, ricarico gli slot
        if (/occupato/i.test(res.message) && date) handleDateChange(date);
      }
    } catch {
      setError("Errore imprevisto. Riprova o chiamaci.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-[70vh] bg-[#0e0e0e] text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white/5 border border-white/10 rounded-2xl p-10">
          <div className="inline-flex w-14 h-14 rounded-full bg-green-500/15 text-green-400 items-center justify-center mb-4">
            <Check size={28} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Richiesta inviata!</h1>
          <p className="text-gray-400">
            Grazie {name}. Ti contatteremo al numero indicato per confermare l&apos;appuntamento.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 mt-6 text-primary font-semibold hover:underline">
            <ArrowLeft size={16} /> Torna alla home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-[#0e0e0e] text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm">
          <ArrowLeft size={16} /> Torna alla home
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Calendar className="text-primary" size={28} />
          <h1 className="text-3xl font-bold tracking-tight">Prenota un intervento</h1>
        </div>
        <p className="text-gray-400 mb-8">
          Scegli giorno e orario in base alla disponibilità dell&apos;officina. Ti ricontatteremo per confermare.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Data */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
              <Calendar size={16} className="text-primary" /> 1. Scegli il giorno
            </label>
            <input
              type="date"
              min={todayStr}
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none [color-scheme:dark]"
            />

            {/* Slot */}
            {date && (
              <div className="mt-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                  <Clock size={16} className="text-primary" /> 2. Scegli l&apos;orario
                </label>
                {loadingSlots ? (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Loader2 size={16} className="animate-spin" /> Carico le disponibilità...
                  </div>
                ) : slots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map((s) => (
                      <button
                        type="button"
                        key={s.startISO}
                        onClick={() => setSelected(s.startISO)}
                        className={`py-2 rounded-lg text-sm font-semibold border transition-colors ${
                          selected === s.startISO
                            ? "bg-primary border-primary text-white"
                            : "bg-black/30 border-white/10 text-gray-200 hover:border-primary"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                ) : slotsLoaded ? (
                  <p className="text-gray-400 text-sm">
                    Nessuna disponibilità in questo giorno (la domenica siamo chiusi). Prova un&apos;altra data.
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {/* 3. Dati */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
              <User size={16} className="text-primary" /> 3. I tuoi dati
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                required
                placeholder="Nome e cognome *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
              />
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  required
                  type="tel"
                  placeholder="Telefono *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 pl-9 text-white focus:border-primary outline-none"
                />
              </div>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  placeholder="Targa (opzionale)"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 pl-9 text-white uppercase focus:border-primary outline-none"
                />
              </div>
              <div className="relative">
                <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 pl-9 text-white focus:border-primary outline-none appearance-none"
                >
                  {SERVICES.map((s) => (
                    <option key={s} value={s} className="bg-[#1a1a1a]">{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              placeholder="Note (sintomo, richiesta...)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-red-400 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!selected || submitting}
            className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            {submitting ? (
              <><Loader2 size={18} className="animate-spin" /> Invio in corso...</>
            ) : (
              <><Check size={18} /> Invia richiesta di prenotazione</>
            )}
          </button>
          {!selected && (
            <p className="text-center text-gray-500 text-xs -mt-4">Scegli data e orario per procedere.</p>
          )}
        </form>
      </div>
    </div>
  );
}
