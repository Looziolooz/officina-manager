"use client";

import { motion } from "framer-motion";
import { Settings, Lock, Mail, ArrowRight, Key, Wrench } from "lucide-react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

// Sentinella usata SOLO per l'accesso dev. Deve combaciare con quella in src/auth.ts.
// Il vero controllo di sicurezza è lato server (NODE_ENV !== "production" + ALLOW_DEV_LOGIN).
const DEV_LOGIN_SENTINEL = "__DEV_LOGIN__";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const router = useRouter();

  // Mostra il pulsante DEV solo se il flag pubblico è attivo (di norma solo in sviluppo).
  const devLoginEnabled = process.env.NEXT_PUBLIC_ALLOW_DEV_LOGIN === "true";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        code: show2FA ? code : undefined,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "2FA_REQUIRED") {
          setShow2FA(true);
          setLoading(false);
          return;
        }
        setError("Credenziali non valide");
        setLoading(false);
      } else {
        router.push("/admin/dashboard");
        router.refresh();
      }
    } catch {
      setError("Errore di connessione");
      setLoading(false);
    }
  }

  async function handleDevLogin() {
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        // L'email è ignorata dal ramo dev lato server (entra come seed admin):
        // serve solo a superare la validazione di formato.
        email: "dev@local.dev",
        password: DEV_LOGIN_SENTINEL,
        redirect: false,
      });

      if (result?.error) {
        setError("Accesso DEV non disponibile (verifica ALLOW_DEV_LOGIN e l'utente admin)");
        setLoading(false);
      } else {
        router.push("/admin/dashboard");
        router.refresh();
      }
    } catch {
      setError("Errore di connessione");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-surface border border-border p-8 rounded-2xl shadow-lg">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-primary/10 rounded-xl mb-4">
              <Settings className="text-primary w-8 h-8" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Area Gestionale
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              Accedi per gestire GT Service
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-muted-foreground ml-1 font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  placeholder="nome@azienda.it"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={show2FA}
                  className="w-full bg-background border border-input rounded-lg py-3 pl-12 pr-4 text-foreground focus:border-primary outline-none transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {!show2FA && (
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground ml-1 font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-background border border-input rounded-lg py-3 pl-12 pr-4 text-foreground focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {show2FA && (
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground ml-1 font-medium">
                  Codice 2FA
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="text"
                    name="code"
                    placeholder="123456"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-background border border-input rounded-lg py-3 pl-12 pr-4 text-foreground focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              {loading ? "Accesso..." : show2FA ? "Verifica" : "Entra nel Sistema"}
              <ArrowRight size={18} />
            </button>
          </form>

          {devLoginEnabled && (
            <div className="mt-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Solo sviluppo
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <button
                type="button"
                onClick={handleDevLogin}
                disabled={loading}
                className="w-full border border-dashed border-amber-400 text-amber-700 hover:bg-amber-50 disabled:opacity-50 font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <Wrench size={16} />
                Accesso DEV (senza password)
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Sistema protetto con crittografia AES-256
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
