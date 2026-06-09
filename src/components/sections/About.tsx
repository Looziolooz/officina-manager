"use client";
import { motion } from "framer-motion";
import { BadgeCheck, Wrench, Cpu } from "lucide-react";
import { SITE_DATA } from "@/constants";

const stats = [
  { icon: <BadgeCheck className="text-orange-500" />, label: "Esperienza", value: "20+ Anni" },
  { icon: <Cpu className="text-orange-500" />, label: "Diagnosi", value: "Avanzata" },
  { icon: <Wrench className="text-orange-500" />, label: "Riparazioni", value: "Garantite" },
];

export default function About() {
  return (
    <section id="chi-siamo" className="py-24 bg-background">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 relative"
          >
            {/* Classi aggiornate per Tailwind v4: bg-linear-to-br e p-px */}
            <div className="aspect-square rounded-2xl bg-linear-to-br from-orange-600 to-blue-600 p-px">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-orange-600/5" />
                <div className="z-10 text-center">
                   <div className="text-primary font-mono text-8xl font-bold opacity-20">GT</div>
                   <p className="text-gray-500 mt-4 uppercase tracking-[0.3em]">Precision Engineering</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <h2 className="text-primary font-semibold tracking-widest uppercase mb-2">Chi Siamo</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              L&apos;evoluzione dell&apos;officina <br/> meccanica a Jonadi.
            </h3>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              {"GT Service non è una semplice officina. Sotto la guida di "}
              <span className="text-white font-semibold">{SITE_DATA.owner}</span>
              {", combiniamo la solida esperienza della meccanica tradizionale con le più moderne tecnologie di diagnosi elettronica."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="mb-2">{stat.icon}</div>
                  <div className="text-white font-bold text-xl">{stat.value}</div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}