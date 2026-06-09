# Supabase SQL Files - Officina Manager

Cartella contenente tutti i file SQL da inserire manualmente su Supabase.

## Ordine di esecuzione:

1. **`01-schema.sql`** - Crea l'intero schema (tabelle, enum, indici)
   - Eseguire nell'SQL Editor di Supabase per primo
   - Include tutte le tabelle per FASE 0-9

2. **`02-initial-data.sql`** - Inserisce dati iniziali
   - Utente admin (cambiare password dopo il primo login)
   - Configurazione SMS provider

3. **`03-rls-policies.sql`** - (Opzionale) Row Level Security
   - Abilita RLS su tabelle principali
   - Personalizzare secondo necessità

## Note tecniche:

- **Connection string**: Usare il formato "Transaction pooler" (porta 6543) per la migliore compatibilità
- **Password admin**: Il file `02-initial-data.sql` contiene una password temporanea hashata. Cambiarla subito dopo il primo login.
- **Prisma**: Dopo aver eseguito lo schema SQL, configurare `DATABASE_URL` in `.env` e eseguire `npx prisma db pull` per sincronizzare il client Prisma.

## Cosa è incluso (Fasi completate):

✅ FASE 0 - Fix preliminari (bcryptjs, colori brand #E30613, apostrofi, userId hardcoded)
✅ FASE 1 - Appuntamenti e Calendario (modello Appointment, enum, indici)
✅ FASE 4 - Fornitori (modello SupplierDelivery)
✅ FASE 5 - Preventivi (modelli Quote, QuoteItem)
✅ FASE 7 - Campagne SMS (modello SMSCampaign)
✅ FASE 9 - Rifiuti (modello WasteRecord)

## Prossimi passi:

1. Eseguire i file SQL su Supabase
2. Configurare `.env` con la connection string
3. Eseguire `npx prisma generate`
4. Procedere con l'implementazione delle UI (FASE 1.2-1.4, 2, 3, ecc.)
