# 🚗 Officina Manager

Sistema gestionale moderno per autofficine meccatroniche, sviluppato con le ultime tecnologie web per garantire velocità, scalabilità e automazione.

## 🛠 Tech Stack

- **Framework:** Next.js 16.1 (App Router & Turbopack)
- **Database:** SQLite (Locale) via Prisma ORM
- **UI:** Tailwind CSS + Lucide React Icons
- **Auth:** NextAuth.js v5 (Credenziali sicure)
- **Email:** Resend (per notifiche automatiche)
- **Linguaggio:** TypeScript

---

## ✅ Funzionalità Implementate

### 1. Gestione Officina (Workflow)
- **Accettazione Veicolo:** Inserimento rapido con Targa, Modello, KM, Dati Cliente.
- **Schede Lavoro:** Gestione stati (*In Attesa, In Lavorazione, Attesa Pezzi, Completato, Consegnato*).
- **Gestione Ricambi:** Aggiunta pezzi di ricambio alla scheda lavoro con calcolo automatico costi.
- **Calcolo Totali:** Somma automatica di Manodopera + Ricambi.
- **Aggiornamento Automatico:** Al momento della consegna ("Consegnato"), il sistema aggiorna le date di Revisione/Tagliando del veicolo se rilevate nella descrizione.

### 2. CRM Clienti Avanzato
- **Anagrafica Completa:** Dati cliente, telefono, email.
- **Garage Virtuale:** Lista di tutti i veicoli posseduti dal cliente.
- **Timeline Interventi:** Cronologia dettagliata di tutti i lavori passati con costi e dettagli.
- **Note Interne:** Campo note modificabile per appunti riservati sull'utente.
- **Business Intelligence:** Statistiche automatiche (Spesa Totale, Numero Interventi, Status VIP).

### 3. Automazione & Marketing
- **Cron Job Scadenze:** Sistema che scansiona il DB per trovare auto con Tagliando (11 mesi) o Revisione (23 mesi) in scadenza.
- **Email Automatiche:** Invio reminder tramite API Resend.

### 4. Sicurezza & Admin
- **Login Protetto:** Autenticazione admin con hashing della password (bcrypt).
- **Compatibilità React 19:** Utilizzo dei nuovi hook `useActionState` per i form.

---

## 🚀 Installazione e Setup

### 1. Prerequisiti
Assicurati di avere Node.js installato.

### 2. Installazione dipendenze
```bash
npm install
