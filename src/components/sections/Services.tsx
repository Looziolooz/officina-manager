"use client";
import { motion } from "framer-motion";
import { 
  Wrench, 
  Cpu, 
  Zap, 
  Thermometer, 
  ShieldCheck, 
  CarFront 
} from "lucide-react";

const services = [
  {
    title: "Meccanica di Precisione",
    description: "Riparazioni motoristiche e manutenzione ordinaria con ricambi certificati.",
    icon: <Wrench className="w-8 h-8" />,
    color: "group-hover:text-orange-500"
  },
  {
    title: "Diagnosi Computerizzata",
    description: "Analisi avanzata delle centraline con strumentazione di ultima generazione.",
    icon: <Cpu className="w-8 h-8" />,
    color: "group-hover:text-blue-500"
  },
  {
    title: "Impianti Elettrici",
    description: "Risoluzione guasti complessi e installazione componenti elettronici.",
    icon: <Zap className="w-8 h-8" />,
    color: "group-hover:text-yellow-500"
  },
  {
    title: "Ricarica Clima",
    description: "Manutenzione e igienizzazione completa dell'impianto di climatizzazione.",
    icon: <Thermometer className="w-8 h-8" />,
    color: "group-hover:text-cyan-500"
  },
  {
    title: "Revisioni e Check-up",
    description: "Controllo completo pre-revisione per garantire la tua sicurezza su strada.",
    icon: <ShieldCheck className="w-8 h-8" />,
    color: "group-hover:text-green-500"
  },
  {
    title: "Assetto e Freni",
    description: "Ottimizzazione della stabilità e massima efficienza del sistema frenante.",
    icon: <CarFront className="w-8 h-8" />,
    color: "group-hover:text-red-500"
  }
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Services() {
  return (
    <section id="servizi" className="py-24 bg-slate-950/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-primary font-semibold tracking-widest uppercase mb-2">I Nostri Interventi</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">Soluzioni su Misura</h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Dalla meccanica classica all&apos;elettronica di bordo, ci prendiamo cura della tua auto con competenza e trasparenza.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -10 }}
              className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-300 backdrop-blur-sm"
            >
              <div className={`mb-6 transition-colors duration-300 ${service.color} text-gray-400`}>
                {service.icon}
              </div>
              <h4 className="text-xl font-bold text-white mb-3 tracking-tight">
                {service.title}
              </h4>
              <p className="text-gray-400 leading-relaxed">
                {service.description}
              </p>
              
              {/* Effetto decorativo interno alla card */}
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                <Wrench className="w-16 h-16 rotate-45" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}