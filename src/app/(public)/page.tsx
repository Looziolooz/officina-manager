"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Car, Cpu, Wrench, ShieldCheck, ArrowRight, Star } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/30">
      
      {/* --- HERO SECTION AVANZATA --- */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        
        {/* 1. Background Tecnico (Grid + Glow) */}
        <div className="absolute inset-0 bg-slate-950">
          {/* Griglia stile "progetto tecnico" */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          {/* Sfumatura radiale centrale per focus */}
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-orange-500 opacity-20 blur-[100px]"></div>
        </div>

        {/* 2. Immagine Auto Scontornata (Effetto 3D) */}
        {/* Se vuoi usare un'immagine reale, sostituisci l'URL. Qui usiamo un placeholder di alta qualità */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
           <Image
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000&auto=format&fit=crop" 
            alt="Supercar Background" 
            fill
            className="w-full h-full object-cover"
           />
        </div>

        {/* 3. Contenuto Principale */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-6 backdrop-blur-sm"
          >
            <Star className="w-4 h-4 fill-orange-500" />
            <span>Officina Certificata 2024</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-6"
          >
            {COMPANY_INFO.name.toUpperCase()}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
              MECCANOTRONICA
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Non ripariamo solo auto. <br/>
            Ottimizziamo le prestazioni del tuo veicolo con diagnostica digitale avanzata.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link 
              href="/contatti" 
              className="group relative px-8 py-4 bg-orange-600 rounded-full font-bold text-lg overflow-hidden transition-transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 origin-left" />
              <span className="relative flex items-center gap-2">
                Prenota Ora <ArrowRight className="w-5 h-5" />
              </span>
            </Link>
            
            <Link 
              href="/servizi" 
              className="px-8 py-4 bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-full font-bold text-lg hover:bg-slate-800 transition-colors"
            >
              I Nostri Servizi
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- CARDS FLUTTUANTI (Glassmorphism) --- */}
      <section className="py-20 bg-slate-950 relative z-10 -mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {[
              { icon: Cpu, title: "Diagnosi AI", text: "Analisi computerizzata errori centralina." },
              { icon: Wrench, title: "Meccanica", text: "Riparazioni strutturali e manutenzione." },
              { icon: ShieldCheck, title: "Garanzia", text: "24 mesi su tutti i ricambi installati." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="p-8 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 hover:border-orange-500/50 transition-all hover:-translate-y-2 shadow-2xl"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-900/40">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-400">{item.text}</p>
              </motion.div>
            ))}

          </div>
        </div>
      </section>

    </div>
  );
}