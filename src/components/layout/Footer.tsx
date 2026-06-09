"use client";
import { Facebook, Instagram, Mail, Phone, MapPin, Settings } from "lucide-react";
import { SITE_DATA } from "@/constants";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-white/10 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="text-primary w-6 h-6" />
              <span className="font-bold text-xl tracking-tighter text-white uppercase">
                GT <span className="text-primary">Service</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Officina Meccanotronica specializzata in diagnosi avanzata e riparazioni meccaniche di alta precisione a Jonadi.
            </p>
            <div className="flex gap-4">
              <a href={SITE_DATA.social} target="_blank" className="p-2 bg-white/5 rounded-full hover:bg-primary transition-colors text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-primary transition-colors text-white">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 italic">Link Rapidi</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">Home</a></li>
              <li><a href="#chi-siamo" className="hover:text-primary transition-colors">Chi Siamo</a></li>
              <li><a href="#servizi" className="hover:text-primary transition-colors">Servizi</a></li>
              <li><a href="#contatti" className="hover:text-primary transition-colors">Dove Siamo</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold mb-6 italic">Contatti</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-primary" /> {SITE_DATA.phone}
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-primary" /> {SITE_DATA.email}
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-primary mt-1" /> {SITE_DATA.address}
              </li>
            </ul>
          </div>

          {/* Orari (Small recap) */}
          <div>
            <h4 className="text-white font-bold mb-6 italic">Orari</h4>
            <div className="text-gray-400 text-sm space-y-2">
              <p>Lun - Ven: <span className="text-white">{SITE_DATA.hours.weekdays}</span></p>
              <p>Sabato: <span className="text-white">{SITE_DATA.hours.saturday}</span></p>
              <p>Domenica: <span className="text-red-500 font-medium">Chiuso</span></p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 uppercase tracking-widest">
          <p>© {currentYear} {SITE_DATA.owner} - P.IVA 03681400792</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}