"use server";

import { requireSession } from "@/lib/auth-guards";

// Dati estraibili da un libretto di circolazione italiano (carta di circolazione
// / Documento Unico). I nomi dei campi corrispondono a quelli del form Nuovo Cliente.
export interface LibrettoData {
  firstName: string | null;
  lastName: string | null;
  fiscalCode: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  province: string | null;
  plate: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  vin: string | null;
  fuelType: string | null;
  engineSize: string | null;
}

export interface ExtractResult {
  success: boolean;
  data?: LibrettoData;
  message?: string;
}

const FUEL_TYPES = ["Diesel", "Benzina", "Ibrida", "Elettrica", "GPL", "Metano"];

const SYSTEM_PROMPT = `Sei un assistente che estrae dati da una FOTO di un libretto di circolazione italiano (carta di circolazione / Documento Unico di Circolazione).
Leggi l'immagine ed estrai SOLO i valori che riesci a leggere con certezza. Per ogni campo non presente, illeggibile o di cui non sei sicuro usa null: è molto meglio restituire null che inventare un valore.
Riferimenti ai codici del libretto: A = targa, B = data prima immatricolazione (da cui ricavare l'anno), D.1 = marca, D.2/D.3 = modello/tipo, E = numero di telaio (VIN), P.1 = cilindrata in cc, P.3 = tipo di alimentazione, C.2 = intestatario (nome/cognome), insieme a codice fiscale e indirizzo.
La targa va in MAIUSCOLO senza spazi.

Rispondi ESCLUSIVAMENTE con un oggetto JSON valido con ESATTAMENTE queste chiavi (usa null se non leggibile):
{"firstName":null,"lastName":null,"fiscalCode":null,"address":null,"city":null,"postalCode":null,"province":null,"plate":null,"brand":null,"model":null,"year":null,"vin":null,"fuelType":null,"engineSize":null}
"year" è un numero (anno), "fuelType" è uno tra: Diesel, Benzina, Ibrida, Elettrica, GPL, Metano. Nessun testo prima o dopo il JSON.`;

export async function extractLibrettoData(fileDataUrl: string): Promise<ExtractResult> {
  await requireSession();

  // Groq: motore AI gratuito, API compatibile con OpenAI.
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { success: false, message: "GROQ_API_KEY non configurata. Crea una chiave gratuita su console.groq.com e mettila nelle variabili d'ambiente." };
  }

  const isImage = typeof fileDataUrl === "string" && fileDataUrl.startsWith("data:image/");
  const isPdf = typeof fileDataUrl === "string" && fileDataUrl.startsWith("data:application/pdf");
  if (isPdf) {
    return { success: false, message: "Con il motore gratuito (Groq) carica una FOTO del libretto (JPG/PNG): il PDF dello scanner non è ancora supportato." };
  }
  if (!isImage) {
    return { success: false, message: "File non valido. Carica una foto (JPG/PNG) del libretto." };
  }
  if (fileDataUrl.length > 14_000_000) {
    return { success: false, message: "Immagine troppo grande. Riprova con una foto più leggera." };
  }

  // Modello vision di Groq (override via GROQ_MODEL se cambia il nome).
  const model = process.env.GROQ_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

  const body = {
    model,
    temperature: 0,
    max_tokens: 800,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: "Estrai i dati anagrafici e del veicolo da questo libretto e rispondi SOLO con il JSON." },
          { type: "image_url", image_url: { url: fileDataUrl } },
        ],
      },
    ],
    response_format: { type: "json_object" },
  };

  let res: Response;
  try {
    res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error("[libretto] richiesta a Groq fallita:", e);
    return { success: false, message: "Impossibile contattare il servizio AI. Riprova." };
  }

  if (!res.ok) {
    // Non logghiamo l'immagine (PII). Solo lo stato e un estratto dell'errore.
    const errText = await res.text().catch(() => "");
    console.error("[libretto] Groq ha risposto", res.status, errText.slice(0, 300));
    return { success: false, message: `Errore dal servizio AI (${res.status}).` };
  }

  let content: string | undefined;
  try {
    const json = await res.json();
    content = json?.choices?.[0]?.message?.content;
  } catch (e) {
    console.error("[libretto] risposta OpenAI non leggibile:", e);
    return { success: false, message: "Risposta del servizio AI non valida." };
  }

  if (!content) {
    return { success: false, message: "Nessun dato estratto dall'immagine." };
  }

  let parsed: LibrettoData;
  try {
    parsed = JSON.parse(content) as LibrettoData;
  } catch (e) {
    console.error("[libretto] JSON non valido dal modello:", e);
    return { success: false, message: "Estrazione non riuscita. Riprova con una foto più nitida." };
  }

  // Normalizzazioni leggere.
  if (parsed.plate) parsed.plate = parsed.plate.toUpperCase().replace(/\s+/g, "");
  if (parsed.province) parsed.province = parsed.province.toUpperCase().trim();
  if (parsed.fuelType && !FUEL_TYPES.includes(parsed.fuelType)) parsed.fuelType = null;

  return { success: true, data: parsed };
}
