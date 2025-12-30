"use client";
import { motion } from "framer-motion";
import { Settings, MapPin, Phone } from "lucide-react";
import { SITE_DATA } from "@/constants";

export default function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-background text-white">
      {/* Fix Tailwind: rimosso spazio dopo la virgola nel gradiente */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-orange-600/10 via-transparent to-transparent" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center px-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-600/30 bg-orange-600/10 text-orange-500 mb-6">
          <Settings className="w-4 h-4 animate-spin-slow" />
          <span className="text-sm font-medium uppercase tracking-wider">Eccellenza Meccanotronica</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tighter">
          {SITE_DATA.name.split(' ')[0]} <span className="text-primary">{SITE_DATA.name.split(' ')[1]}</span>
        </h1>
        
        {/* Fix ESLint: Uso delle graffe per gestire gli apostrofi in "L'officina" */}
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
          {"L'officina di "} 
          <span className="text-white font-semibold">{SITE_DATA.owner}</span> 
          {" dove l'elettronica incontra la meccanica di precisione."}
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <a href={`tel:${SITE_DATA.phone}`} className="flex items-center justify-center gap-2 bg-primary hover:bg-orange-700 transition-colors px-8 py-4 rounded-lg font-bold">
            <Phone size={20} /> Prenota Intervento
          </a>
          <a href="#contatti" className="flex items-center justify-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all px-8 py-4 rounded-lg font-bold">
            <MapPin size={20} /> Dove Siamo
          </a>
        </div>
      </motion.div>
    </section>
  );
}