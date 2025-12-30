"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Settings, UserLock } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Chi Siamo", href: "#chi-siamo" },
  { name: "Servizi", href: "#servizi" },
  { name: "Dove Siamo", href: "#contatti" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container flex justify-between items-center h-20">
        <Link href="/" className="flex items-center gap-2 group">
          <Settings className="text-primary w-8 h-8 group-hover:rotate-90 transition-transform duration-500" />
          <span className="font-bold text-xl tracking-tighter text-white">
            GT <span className="text-primary">SERVICE</span>
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-gray-400 hover:text-primary transition-colors font-medium text-xs uppercase tracking-widest"
            >
              {link.name}
            </Link>
          ))}

          {session ? (
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-700 transition-all text-xs uppercase"
            >
              <Settings size={16} /> Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="p-2 text-gray-500 hover:text-white border border-white/5 hover:border-white/10 hover:bg-white/5 rounded-lg transition-all"
              title="Area Riservata"
            >
              <UserLock size={20} />
            </Link>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white p-2 hover:bg-white/5 rounded-lg"
          aria-label="Toggle Menu"
        >
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
            className="md:hidden bg-background border-b border-white/10"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg text-gray-300 font-semibold hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href={session ? "/admin/dashboard" : "/auth/login"}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg font-bold mt-2 hover:bg-orange-700 transition-all"
              >
                <UserLock size={18} />
                {session ? "Dashboard" : "Area Riservata"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}