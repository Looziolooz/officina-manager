"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Car, AlertCircle, Save, ScanLine, Camera, Loader2, CheckCircle } from "lucide-react";
import { createCustomerWithVehicle } from "@/app/actions/customer";
import { extractLibrettoData } from "@/app/actions/libretto";
import { customerWithVehicleSchema, type CustomerWithVehicleFormData } from "@/lib/schemas";
import { useState, useTransition } from "react";
import Link from "next/link";

// Riduce l'immagine lato client (lato lungo max 2000px, JPEG) prima di inviarla:
// payload leggero (sotto il limite delle server action) e meno costo/latency OpenAI.
async function downscaleImage(file: File, maxDim = 2000, quality = 0.85): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("read error"));
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("image error"));
    i.src = dataUrl;
  });
  let { width, height } = img;
  if (Math.max(width, height) > maxDim) {
    const scale = maxDim / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

// Legge un file (es. PDF dello scanner) come data URL base64, senza modifiche.
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("read error"));
    reader.readAsDataURL(file);
  });
}

export default function NewCustomerPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [scanState, setScanState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // FIX: Rimosso <CustomerFormData> generico per lasciare che il resolver inferisca i tipi corretti
  // (questo risolve il conflitto con z.coerce.number)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerWithVehicleSchema),
    defaultValues: {
      firstName: "", 
      lastName: "", 
      phone: "", 
      email: "",
       plate: "", 
       brand: "", 
       model: "",
      year: new Date().getFullYear(),
      technicalNotes: "", 
      familyNotes: "", 
      vin: "", 
      fuelType: "Diesel",
      address: "",
      alternatePhone: "",
      companyName: "",
      vatNumber: "",
      fiscalCode: "",
      city: "",
      postalCode: "",
      province: "",
      pec: "",
      sdiCode: "",
      engineSize: ""
    }
  });

  // FIX: Tipizziamo esplicitamente l'handler
  const onSubmit: SubmitHandler<CustomerWithVehicleFormData> = (data) => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString());
        }
      });

      const result = await createCustomerWithVehicle(formData);

      if (result && !result.success && result.message) {
        setError(typeof result.message === 'string' ? result.message : "Errore durante il salvataggio");
      }
    });
  };

  // Scan del libretto: riduce l'immagine, la manda all'AI e precompila il form.
  async function handleLibrettoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permette di riselezionare lo stesso file
    if (!file) return;

    setScanState("loading");
    setScanMessage(null);
    try {
      let dataUrl: string;
      if (file.type === "application/pdf") {
        // Scansione da fotocopiatrice: PDF inviato così com'è (anche multipagina).
        if (file.size > 10 * 1024 * 1024) {
          setScanState("error");
          setScanMessage("PDF troppo grande (max 10MB). Riduci la risoluzione dello scanner.");
          return;
        }
        dataUrl = await fileToDataUrl(file);
      } else if (file.type.startsWith("image/")) {
        dataUrl = await downscaleImage(file);
      } else {
        setScanState("error");
        setScanMessage("Formato non supportato. Usa una foto (JPG/PNG) o una scansione PDF.");
        return;
      }
      const result = await extractLibrettoData(dataUrl);

      if (!result.success || !result.data) {
        setScanState("error");
        setScanMessage(result.message || "Estrazione non riuscita.");
        return;
      }

      const d = result.data;
      const fields: Array<[keyof CustomerWithVehicleFormData, string | number | null]> = [
        ["firstName", d.firstName], ["lastName", d.lastName], ["fiscalCode", d.fiscalCode],
        ["address", d.address], ["city", d.city], ["postalCode", d.postalCode],
        ["province", d.province], ["plate", d.plate], ["brand", d.brand], ["model", d.model],
        ["year", d.year], ["vin", d.vin], ["fuelType", d.fuelType], ["engineSize", d.engineSize],
      ];

      let count = 0;
      for (const [key, value] of fields) {
        if (value !== null && value !== undefined && value !== "") {
          setValue(key, value as never, { shouldDirty: true });
          count++;
        }
      }

      setScanState("done");
      setScanMessage(
        count > 0
          ? `Estratti ${count} campi dal libretto. Controlla i dati e completa quelli mancanti (telefono, km), poi salva.`
          : "Nessun campo leggibile. Prova con una foto più nitida e ben illuminata."
      );
    } catch (err) {
      console.error(err);
      setScanState("error");
      setScanMessage("Errore durante la lettura dell'immagine.");
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/customers" className="text-gray-400 hover:text-white">
           ← Torna indietro
        </Link>
        <h1 className="text-3xl font-bold text-white">Nuovo Cliente</h1>
      </div>

      {/* SCAN LIBRETTO: precompila il form dalla foto del libretto */}
      <div className="bg-slate-900/50 border border-dashed border-primary/40 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <ScanLine className="text-primary" size={24} />
          <h2 className="text-xl font-bold text-white">Compila dal libretto</h2>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Scatta una foto, oppure carica la <strong>scansione della fotocopiatrice</strong> (PDF o
          immagine) del libretto di circolazione: i campi qui sotto verranno compilati
          automaticamente. Controlla sempre i dati prima di salvare. Telefono e km non sono sul
          libretto: vanno inseriti a mano.
        </p>
        <div className="flex flex-wrap gap-3">
          {/* Scatta foto (su mobile apre la fotocamera) */}
          <label
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold cursor-pointer transition-all ${
              scanState === "loading"
                ? "bg-white/10 text-gray-400 cursor-wait"
                : "bg-primary hover:bg-primary-hover text-white"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleLibrettoFile}
              disabled={scanState === "loading"}
            />
            {scanState === "loading" ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Lettura in corso...
              </>
            ) : (
              <>
                <Camera size={18} /> Scatta foto
              </>
            )}
          </label>

          {/* Carica scansione fotocopiatrice (PDF) o immagine dal computer */}
          <label
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold cursor-pointer transition-all border ${
              scanState === "loading"
                ? "border-white/10 text-gray-500 cursor-wait"
                : "border-white/20 text-white hover:bg-white/5"
            }`}
          >
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleLibrettoFile}
              disabled={scanState === "loading"}
            />
            <ScanLine size={18} /> Carica scansione (PDF/immagine)
          </label>
        </div>
        {scanMessage && (
          <div
            className={`mt-4 text-sm flex items-start gap-2 ${
              scanState === "error" ? "text-red-400" : "text-green-400"
            }`}
          >
            {scanState === "error" ? (
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle size={16} className="mt-0.5 shrink-0" />
            )}
            <span>{scanMessage}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* SEZIONE 1: CLIENTE */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <User className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-white">Anagrafica Cliente</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nome *</label>
              <input {...register("firstName")} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" placeholder="Mario" />
              {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Cognome *</label>
              <input {...register("lastName")} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" placeholder="Rossi" />
              {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Telefono *</label>
              <input {...register("phone")} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" placeholder="+39 333..." />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input {...register("email")} type="email" className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" placeholder="mario@email.com" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message as string}</p>}
            </div>
          </div>
          
          <div className="mt-4">
             <label className="block text-sm text-gray-400 mb-1">Note Tecniche (Opzionale)</label>
             <textarea {...register("technicalNotes")} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" rows={2} placeholder="Es. Preferisce ricambi originali..." />
          </div>
        </div>

        {/* SEZIONE 2: VEICOLO */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <Car className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-white">Dati Veicolo</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Targa *</label>
              <input {...register("plate")} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white uppercase font-mono focus:border-primary outline-none" placeholder="AB123CD" />
              {errors.plate && <p className="text-red-400 text-xs mt-1">{errors.plate.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Marca *</label>
              <input {...register("brand")} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" placeholder="Fiat" />
              {errors.brand && <p className="text-red-400 text-xs mt-1">{errors.brand.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Modello *</label>
              <input {...register("model")} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" placeholder="Panda" />
              {errors.model && <p className="text-red-400 text-xs mt-1">{errors.model.message as string}</p>}
            </div>
            <div>
               <label className="block text-sm text-gray-400 mb-1">Anno</label>
               <input {...register("year")} type="number" className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" />
            </div>
            <div>
               <label className="block text-sm text-gray-400 mb-1">Alimentazione</label>
               <select {...register("fuelType")} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none">
                  <option value="Diesel">Diesel</option>
                  <option value="Benzina">Benzina</option>
                  <option value="Ibrida">Ibrida</option>
                  <option value="Elettrica">Elettrica</option>
                  <option value="GPL">GPL</option>
                  <option value="Metano">Metano</option>
               </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            "Salvataggio in corso..."
          ) : (
            <>
              <Save size={20} /> Salva Cliente e Veicolo
            </>
          )}
        </button>
      </form>
    </div>
  );
}