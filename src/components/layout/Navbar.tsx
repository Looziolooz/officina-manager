"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Settings } from "lucide-react";
import { SITE_DATA } from "@/constants";

const navLinks = [
  { name: "Home", href: "#" },
  { name: "Chi Siamo", href: "#chi-siamo" },
  { name: "Servizi", href: "#servizi" }, 
  { name: "Dove Siamo", href: "#contatti" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container flex justify-between items-center h-20">
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <Settings className="text-primary w-8 h-8" />
          <span className="font-bold text-xl tracking-tighter text-white">
            GT <span className="text-primary">SERVICE</span>
          </span>
        </div>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex gap-8">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-gray-400 hover:text-primary transition-colors font-medium">
              {link.name}
            </a>
          ))}
        </div>

        {/* MOBILE TOGGLE */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white p-2">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setIsOpen(false)}
                  className="text-xl text-gray-300 font-semibold"
                >
                  {link.name}
                </a>
              ))}
              <a href={`tel:${SITE_DATA.phone}`} className="bg-primary text-white text-center py-4 rounded-xl font-bold mt-4">
                Chiama Ora
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}