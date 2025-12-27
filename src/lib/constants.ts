// src/lib/constants.ts

export const COMPANY_INFO = {
  name: "GT Service",
  subtitle: "Officina Meccanotronica",
  owner: "Giovanni Tambuscio",
  address: "Via Giuseppe Verdi, 89851 Jonadi (VV)",
  phone: "+39 340 908 1839",
  email: "info@gtservice.it", // Email placeholder (chiedila al cliente dopo)
  vat: "00000000000", // P.IVA da chiedere
  googleMapsUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3106.678123456789!2d16.0500!3d38.6500!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zVmlhIEdpdXNlcHBlIFZlcmRpLCBKb25hZGkgVlY!5e0!3m2!1sit!2sit!4v1600000000000!5m2!1sit!2sit", // URL generico su Jonadi, poi lo affiniamo
};

export const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Servizi", href: "/servizi" },
  { name: "Chi Siamo", href: "/chi-siamo" },
  { name: "Contatti", href: "/contatti" },
];

// Definiamo qui gli stati per poterli importare ovunque senza errori "use server"
// src/lib/constants.ts

// src/lib/constants.ts

export const JOB_STATUS = {
  SCHEDULED: "SCHEDULATO",       
  IN_PROGRESS: "IN_LAVORAZIONE", 
  WAITING_PARTS: "ATTESA_RICAMBI", 
  COMPLETED: "COMPLETATO",       // Lavoro finito in officina
  DELIVERED: "CONSEGNATO"        // Auto ritirata dal cliente (Archiviato)
} as const;

export const STATUS_LABELS = {
  [JOB_STATUS.SCHEDULED]: "In Coda",
  [JOB_STATUS.IN_PROGRESS]: "In Lavorazione",
  [JOB_STATUS.WAITING_PARTS]: "Attesa Ricambi",
  [JOB_STATUS.COMPLETED]: "Pronto",
  [JOB_STATUS.DELIVERED]: "Consegnato"
};

export const JOB_STATUS_COLORS = {
  [JOB_STATUS.SCHEDULED]: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  [JOB_STATUS.IN_PROGRESS]: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  [JOB_STATUS.WAITING_PARTS]: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  [JOB_STATUS.COMPLETED]: "bg-green-500/10 text-green-400 border-green-500/20",
  [JOB_STATUS.DELIVERED]: "bg-slate-800 text-slate-500 border-slate-800",
};