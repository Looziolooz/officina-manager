"use client";

import { useState, useTransition } from "react";
import { MessageCircle, Send, Clock, AlertCircle, CheckCircle, Info } from "lucide-react";
import { runRemindersNow } from "@/app/actions/whatsapp";
import type { ReminderRunResult } from "@/lib/whatsapp-reminders";

export default function WhatsAppPage() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ReminderRunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleRun() {
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const r = await runRemindersNow(7);
        setResult(r);
      } catch {
        setError("Esecuzione fallita. Controlla i log del server.");
      }
    });
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <MessageCircle className="text-primary" size={28} />
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">WhatsApp</h1>
          <p className="text-gray-400">Promemoria automatici tagliando e revisione</p>
        </div>
      </div>

      {/* Promemoria automatici */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="text-primary" size={20} />
          <h2 className="text-lg font-bold text-white">Promemoria automatici</h2>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Il sistema invia un promemoria WhatsApp ai clienti con tagliando o revisione in
          scadenza nei prossimi 7 giorni (in base ai dati del veicolo). Ogni cliente riceve
          il promemoria una sola volta per scadenza. Qui puoi eseguirlo subito per provarlo.
        </p>

        <button
          onClick={handleRun}
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-5 py-3 rounded-lg font-semibold transition-all"
        >
          <Send size={18} />
          {isPending ? "Invio in corso..." : "Invia promemoria ora"}
        </button>

        {error && (
          <div className="mt-4 flex items-start gap-2 text-red-400 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="mt-4 rounded-lg bg-black/30 border border-white/10 p-4">
            <div className="flex items-center gap-2 text-green-400 text-sm font-semibold mb-3">
              <CheckCircle size={16} /> Esecuzione completata
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <Stat label="In scadenza" value={result.due} />
              <Stat label="Inviati" value={result.sent} color="text-green-400" />
              <Stat label="Saltati" value={result.skipped} color="text-gray-300" />
              <Stat label="Falliti" value={result.failed} color={result.failed > 0 ? "text-red-400" : "text-gray-300"} />
            </div>
            {result.details.length > 0 && (
              <ul className="mt-4 space-y-1 text-xs text-gray-400">
                {result.details.map((d, i) => (
                  <li key={i}>• {d}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Setup / automazione */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Info className="text-blue-400" size={20} />
          <h2 className="text-lg font-bold text-white">Automazione e configurazione</h2>
        </div>
        <ul className="text-sm text-gray-400 space-y-2 list-disc pl-5">
          <li>
            Per l&apos;invio automatico ogni giorno, chiama questo endpoint da uno scheduler
            (cron / Vercel Cron):
            <code className="block mt-1 bg-black/40 rounded px-2 py-1 text-gray-300 text-xs break-all">
              GET /api/cron/whatsapp-reminders &nbsp;(header: Authorization: Bearer &lt;CRON_SECRET&gt;)
            </code>
          </li>
          <li>
            Imposta <code className="text-gray-300">TWILIO_WHATSAPP_FROM</code> con il tuo numero
            WhatsApp Business approvato. In sviluppo usa la <strong>sandbox Twilio</strong>: il
            cliente deve prima iscriversi inviando il codice <em>join</em> indicato nella console Twilio.
          </li>
          <li>
            I messaggi business-initiated richiedono <strong>template approvati</strong> da Meta in produzione.
          </li>
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value, color = "text-white" }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-lg bg-slate-800/60 p-3">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}
