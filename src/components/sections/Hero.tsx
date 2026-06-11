import { Settings, MapPin, Phone } from "lucide-react";
import { SITE_DATA } from "@/constants";

export default function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-[#0e0e0e] text-white">
      {/* Foto officina (Unsplash). Per usare la TUA: metti public/hero.jpg e src="/hero.jpg" */}
      <img
        src="https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=1920&q=70"
        alt="Officina meccanica GT Service"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      {/* Overlay scuro per leggibilità + accento rosso brand */}
      <div className="absolute inset-0 bg-linear-to-b from-[#0e0e0e]/80 via-[#0e0e0e]/85 to-[#0e0e0e]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />

      <div className="z-10 text-center px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary mb-6">
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
          <a href={`tel:${SITE_DATA.phone}`} className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover transition-colors px-8 py-4 rounded-lg font-bold">
            <Phone size={20} /> Prenota Intervento
          </a>
          <a href="#contatti" className="flex items-center justify-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all px-8 py-4 rounded-lg font-bold">
            <MapPin size={20} /> Dove Siamo
          </a>
        </div>
      </div>
    </section>
  );
}