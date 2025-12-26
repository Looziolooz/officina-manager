"use client";

import { COMPANY_INFO } from "@/lib/constants";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Mail, MapPin, Phone, Clock } from "lucide-react";

export default function ContattiPage() {
  return (
    <div className="min-h-screen bg-slate-950 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contattaci</h1>
          <p className="text-slate-400 text-lg">Siamo a tua disposizione per preventivi e appuntamenti.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Info Card */}
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-6">
              
              <div className="flex items-start gap-4">
                <div className="bg-orange-500/10 p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Dove siamo</h3>
                  <p className="text-slate-400">{COMPANY_INFO.address}</p>
                  <p className="text-slate-500 text-sm mt-1">Provincia di Vibo Valentia</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-orange-500/10 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Telefono</h3>
                  <p className="text-slate-400">Giovanni Tambuscio</p>
                  <a href={`tel:${COMPANY_INFO.phone.replace(/\s/g, '')}`} className="text-2xl font-bold text-white hover:text-orange-500 transition-colors">
                    {COMPANY_INFO.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-orange-500/10 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Orari</h3>
                  <p className="text-slate-400">Lun - Ven: 08:30 - 13:00 / 14:30 - 18:30</p>
                  <p className="text-slate-400">Sabato: 08:30 - 12:30</p>
                  <p className="text-red-400">Domenica: Chiuso</p>
                </div>
              </div>

            </div>
          </div>

          {/* Map Section */}
          <div className="h-[400px] lg:h-auto bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 relative">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3106.903803623631!2d16.0594833!3d38.6276833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x133fbd1000000001%3A0x1c8b3d6d0c0c0c0!2sVia%20Giuseppe%20Verdi%2C%20Jonadi%20VV!5e0!3m2!1sit!2sit!4v1700000000000!5m2!1sit!2sit" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
            ></iframe>
          </div>

        </div>
      </div>
    </div>
  );
}