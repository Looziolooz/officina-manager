"use client";

import { useActionState } from "react"; // [!code ++] Aggiornato per React 19
import { useFormStatus } from "react-dom";
import { authenticate } from "@/app/actions/auth";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  // [!code warning] useFormState è diventato useActionState
  // useActionState restituisce [state, action, isPending]
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full space-y-8 bg-slate-900 p-8 rounded-xl border border-slate-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Officina<span className="text-orange-500">Pro</span>
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Accedi al pannello di controllo
          </p>
        </div>
        
        <form action={dispatch} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">Email</label>
              <input 
                name="email" 
                type="email" 
                required 
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-orange-500 outline-none transition-colors"
                placeholder="admin@officina.it"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">Password</label>
              <input 
                name="password" 
                type="password" 
                required 
                minLength={6}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-orange-500 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <LoginButton />
          
          {errorMessage && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/10 p-3 rounded-lg border border-red-900/20">
              <AlertCircle className="w-4 h-4" />
              <p>{errorMessage}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      {pending ? "Accesso in corso..." : "Accedi"}
    </button>
  );
}