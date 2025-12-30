"use client";
import { motion } from "framer-motion";
import { Settings, Lock, Mail, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [loading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-4">
              <Settings className="text-primary w-8 h-8 animate-spin-slow" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Area Gestionale</h1>
            <p className="text-gray-400 text-sm mt-2">Accedi per gestire GT Service</p>
          </div>

          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-500 ml-1">Email Aziendale</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input 
                  type="email" 
                  placeholder="nome@gtservice.it"
                  className="w-full bg-slate-900 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-500 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input 
                  type="password" 
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-primary hover:bg-orange-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-600/20"
            >
              Entra nel Sistema <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-600 uppercase tracking-tighter">
              Sistema di sicurezza criptato con standard AES-256
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}