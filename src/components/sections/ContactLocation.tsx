"use client";
import { motion } from "framer-motion";
import { MapPin, Clock, Phone, Mail, ChevronRight } from "lucide-react";
import { SITE_DATA } from "@/constants";

export default function ContactLocation() {
  return (
    <section id="contatti" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Dove Siamo & Contatti</h2>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* INFO CARD - Glassmorphism */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/20 rounded-lg text-primary">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Indirizzo</h3>
                <p className="text-gray-400">{SITE_DATA.address}</p>
                <a 
                  href="https://www.google.com/maps/dir/?api=1&destination=Via+Giuseppe+Verdi+Jonadi+VV" 
                  target="_blank"
                  className="text-primary text-sm font-semibold flex items-center mt-2 hover:underline"
                >
                  Ottieni indicazioni <ChevronRight size={16} />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent/20 rounded-lg text-accent">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Orari di Apertura</h3>
                <div className="text-gray-400 mt-1">
                  <p className="flex justify-between gap-8"><span>Lun - Ven:</span> <span className="text-white">{SITE_DATA.hours.weekdays}</span></p>
                  <p className="flex justify-between gap-8"><span>Sabato:</span> <span className="text-white">{SITE_DATA.hours.saturday}</span></p>
                  <p className="flex justify-between gap-8 text-red-400"><span>Domenica:</span> <span>Chiuso</span></p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-4">
              <a href={`tel:${SITE_DATA.phone}`} className="flex items-center gap-4 text-gray-300 hover:text-primary transition-colors">
                <Phone size={20} /> {SITE_DATA.phone}
              </a>
              <a href={`mailto:${SITE_DATA.email}`} className="flex items-center gap-4 text-gray-300 hover:text-primary transition-colors">
                <Mail size={20} /> {SITE_DATA.email}
              </a>
            </div>
          </motion.div>

          {/* MAPPA INTERATTIVA */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="h-112.5 w-full rounded-3xl overflow-hidden border border-white/10 grayscale-[0.3] hover:grayscale-0 transition-all duration-700 shadow-2xl"
            >
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3106.326344585141!2d16.0573!3d38.64!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDM4JzI0LjAiTiAxNsKwMDMnMjYuMyJF!5e0!3m2!1sit!2sit!4v1700000000000!5m2!1sit!2sit" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </motion.div>

        </div>
      </div>
    </section>
  );
}