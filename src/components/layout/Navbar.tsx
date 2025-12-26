"use client";

import Link from "next/link";
import { Wrench } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
            <Wrench className="text-orange-500" />
            <span>Officina<span className="text-orange-500">Pro</span></span>
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors">Home</Link>
            <Link href="/servizi" className="text-slate-300 hover:text-white transition-colors">Servizi</Link>
            <Link href="/chi-siamo" className="text-slate-300 hover:text-white transition-colors">Chi Siamo</Link>
            <Link href="/contatti" className="text-slate-300 hover:text-white transition-colors">Contatti</Link>
          </div>

          {/* Admin Button */}
          <div>
            <Link 
              href="/admin/dashboard" 
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Area Riservata
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}