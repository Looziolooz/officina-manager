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

// Schema per gli Structured Outputs di OpenAI (strict: ogni campo richiesto, nullable).
const LIBRETTO_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    firstName: { type: ["string", "null"], description: "Nome dell'intestatario (campo C.2.1 / persona fisica)" },
    lastName: { type: ["string", "null"], description: "Cognome dell'intestatario; per le aziende lascia null" },
    fiscalCode: { type: ["string", "null"], description: "Codice fiscale dell'intestatario" },
    address: { type: ["string", "null"], description: "Indirizzo (via e numero civico)" },
    city: { type: ["string", "null"], description: "Comune / città di residenza" },
    postalCode: { type: ["string", "null"], description: "CAP" },
    province: { type: ["string", "null"], description: "Sigla provincia, es. MI, RM" },
    plate: { type: ["string", "null"], description: "Targa (campo A), senza spazi, maiuscolo" },
    brand: { type: ["string", "null"], description: "Marca / casa costruttrice (campo D.1)" },
    model: { type: ["string", "null"], description: "Modello o tipo (campo D.2 / D.3)" },
    year: { type: ["integer", "null"], description: "Anno di prima immatricolazione (dalla data campo B)" },
    vin: { type: ["string", "null"], description: "Numero di telaio / VIN (campo E)" },
    fuelType: { type: ["string", "null"], enum: [...FUEL_TYPES, null], description: "Tipo di alimentazione" },
    engineSize: { type: ["string", "null"], description: "Cilindrata in cc (campo P.1) come numero, es. 1248" },
  },
  required: [
    "firstName", "lastName", "fiscalCode", "address", "city", "postalCode",
    "province", "plate", "brand", "model", "year", "vin", "fuelType", "engineSize",
  ],
} as const;

const SYSTEM_PROMPT = `Sei un assistente che estrae dati da una foto o scansione di un libretto di circolazione italiano (carta di circolazione / Documento Unico di Circolazione).
Leggi l'immagine ed estrai SOLO i valori che riesci a leggere con certezza. Per ogni campo non presente, illeggibile o di cui non sei sicuro usa null: è molto meglio restituire null che inventare un valore.
Riferimenti ai codici del libretto: A = targa, B = data prima immatricolazione (da cui ricavare l'anno), D.1 = marca, D.2/D.3 = modello/tipo, E = numero di telaio (VIN), P.1 = cilindrata in cc, P.3 = tipo di alimentazione, C.2 = intestatario (nome/cognome), insieme a codice fiscale e indirizzo.
La targa va restituita in maiuscolo senza spazi. Non aggiungere commenti: restituisci esclusivamente i dati strutturati richiesti.`;

export async function extractLibrettoData(fileDataUrl: string): Promise<ExtractResult> {
  await requireSession();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { success: false, message: "OPENAI_API_KEY non configurata sul server." };
  }

  const isImage = typeof fileDataUrl === "string" && fileDataUrl.startsWith("data:image/");
  const isPdf = typeof fileDataUrl === "string" && fileDataUrl.startsWith("data:application/pdf");
  if (!isImage && !isPdf) {
    return { success: false, message: "File non valido. Carica una foto (JPG/PNG) o una scansione PDF." };
  }
  // Limite di sicurezza: ~14MB di data URL (foto già ridotta lato client; PDF di scansione).
  if (fileDataUrl.length > 14_000_000) {
    return { success: false, message: "File troppo grande. Usa una foto più leggera o riduci la risoluzione dello scanner." };
  }

  // Foto -> contenuto immagine; scansione PDF (anche multipagina, es. fronte/retro) -> contenuto file.
  const fileContent = isPdf
    ? { type: "file", file: { filename: "libretto.pdf", file_data: fileDataUrl } }
    : { type: "image_url", image_url: { url: fileDataUrl, detail: "high" } };

  const body = {
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 800,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: "Estrai i dati anagrafici e del veicolo da questo libretto di circolazione." },
          fileContent,
        ],
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: "libretto", strict: true, schema: LIBRETTO_SCHEMA },
    },
  };

  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error("[libretto] richiesta a OpenAI fallita:", e);
    return { success: false, message: "Impossibile contattare il servizio AI. Riprova." };
  }

  if (!res.ok) {
    // Non logghiamo l'immagine (PII). Solo lo stato e un estratto dell'errore.
    const errText = await res.text().catch(() => "");
    console.error("[libretto] OpenAI ha risposto", res.status, errText.slice(0, 300));
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
