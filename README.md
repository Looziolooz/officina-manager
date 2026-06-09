# 🔧 Officina Manager

Sistema completo per la gestione di un'officina meccanica, sviluppato con Next.js, Prisma e PostgreSQL.

## 📋 Caratteristiche

### ✅ Gestione Clienti
- Anagrafica completa clienti (dati personali, fiscali, veicoli)
- Gestione multipli veicoli per cliente
- Cronologia interventi e fatturazione
- Sistema SMS per promemoria e notifiche

### ✅ Gestione Officina
- **Kanban Board** per gestione lavori in tempo reale
- Stati lavoro: Pianificato → In Corso → In Attesa Ricambi → Completato → Consegnato
- Assegnazione meccanici
- Foto veicolo e documentazione
- Note interne e comunicazioni

### ✅ Preventivi e Fatturazione
- Creazione preventivi dettagliati
- Conversione preventivo → Lavoro
- Conversione preventivo → Fattura
- Gestione aliquote IVA
- Esportazione PDF
- Fatturazione elettronica (XML)

### ✅ Magazzino e Ricambi
- Gestione articoli con codici e barcode
- Tracciabilità stock (carico/scarico)
- Alert automatici scorte minime
- Storico movimentazioni
- Gestione fornitori e consegne

### ✅ SMS e Marketing
- Integrazione provider SMS (Twilio, Vonage, MessageBird)
- Invio SMS automatici (promemoria, lavoro pronto, etc.)
- Campagne marketing mirate
- Storico messaggi inviati

### ✅ Calendario e Appuntamenti
- Vista settimanale appuntamenti
- Prenotazione online (walk-in)
- Promemoria automatici
- Gestione disponibilità

### ✅ Reportistica e Analytics
- KPI e metriche officina
- Ricavi e profittabilità
- Performance meccanici
- Export dati (JSON, CSV, SQL)
- Grafici interattivi

### ✅ Sicurezza e Audit
- Autenticazione NextAuth v5
- 2FA (Two-Factor Authentication)
- Gestione ruoli (Super Admin, Admin, Manager, Meccanico, Receptionist, Viewer)
- Audit log completo
- Blocco account dopo tentativi falliti

### ✅ Gestione Rifiuti
- Registro rifiuti normativo
- Tracciabilità smaltimento
- Statistiche per tipo rifiuto

## 🚀 Quick Start

### Prerequisiti
- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Installazione

1. **Clona il repository**
   ```bash
   git clone <repo-url>
   cd officina-manager
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Configura le variabili d'ambiente**
   ```bash
   cp .env.example .env
   # Modifica .env con i tuoi dati
   ```

4. **Setup database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   npm run seed
   ```

5. **Avvia il server di sviluppo**
   ```bash
   npm run dev
   ```

6. **Apri il browser**
   Visita [http://localhost:3000](http://localhost:3000)

## 📁 Struttura Progetto

```
officina-manager/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Area amministrativa
│   │   │   ├── dashboard/     # Dashboard principale
│   │   │   ├── customers/     # Gestione clienti
│   │   │   ├── workshop/      # Gestione lavori (Kanban)
│   │   │   ├── quotes/        # Preventivi
│   │   │   ├── accounting/    # Fatturazione
│   │   │   ├── inventory/     # Magazzino
│   │   │   ├── warehouse/     # Gestione stock
│   │   │   ├── calendar/      # Calendario
│   │   │   ├── marketing/     # SMS e campagne
│   │   │   ├── users/         # Gestione utenti
│   │   │   ├── audit/         # Audit log
│   │   │   ├── reports/       # Reportistica
│   │   │   └── settings/      # Impostazioni
│   │   ├── auth/             # Autenticazione
│   │   └── api/              # API routes
│   ├── components/           # React components
│   │   ├── ui/              # UI components
│   │   ├── workshop/         # Workshop components
│   │   ├── warehouse/        # Warehouse components
│   │   └── ...
│   ├── lib/                 # Librerie e utilità
│   │   ├── db.ts            # Prisma client
│   │   ├── auth.config.ts   # NextAuth config
│   │   ├── audit.ts         # Audit logging
│   │   ├── security/        # Security utilities
│   │   └── sms/             # SMS providers
│   ├── actions/              # Server Actions
│   ├── types/               # TypeScript types
│   └── schemas/             # Zod validation schemas
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── seed.ts              # Seed data
│   └── sql/                # SQL scripts
├── public/                  # Static assets
├── docker-compose.yml       # Docker setup
├── Dockerfile               # Docker build
├── jest.config.js           # Jest configuration
└── package.json            # Dependencies
```

## 🔧 Scripts Disponibili

```bash
npm run dev          # Avvia server sviluppo
npm run build        # Build produzione
npm run start        # Avvia server produzione
npm run lint        # Lint codice
npm run test        # Esegui test
npm run test:watch  # Test in watch mode
npm run test:coverage # Test con coverage
npx prisma studio  # GUI database browser
```

## 🔐 API Endpoints

### Customers
- `GET /api/customers/search?q=query` - Cerca clienti
- `POST /api/customers` - Crea cliente
- `GET /api/customers/[id]` - Dettaglio cliente

### Vehicles
- `GET /api/vehicles/search?q=plate` - Cerca veicoli
- `POST /api/vehicles` - Aggiungi veicolo

### Jobs (Lavori)
- `GET /api/jobs` - Lista lavori
- `POST /api/jobs` - Crea lavoro
- `PATCH /api/jobs/[id]` - Aggiorna lavoro

### Invoices
- `GET /api/invoices` - Lista fatture
- `POST /api/invoices` - Crea fattura
- `GET /api/invoices/[id]` - Dettaglio fattura

### Inventory
- `GET /api/inventory` - Lista articoli
- `POST /api/inventory` - Aggiungi articolo
- `POST /api/inventory/movement` - Movimento stock

## 🧪 Testing

Il progetto usa Jest e React Testing Library.

```bash
# Esegui tutti i test
npm test

# Test in watch mode
npm run test:watch

# Test con coverage
npm run test:coverage
```

Esempio test:
```typescript
import { createCustomer } from "@/app/actions/customer.actions";

test("crea cliente con successo", async () => {
  const formData = new FormData();
  formData.append("firstName", "Mario");
  // ...
  const result = await createCustomer(formData);
  expect(result.success).toBe(true);
});
```

## 🐳 Docker

### Sviluppo con Docker Compose

```bash
# Avvia tutti i servizi (db, redis, app)
docker-compose up -d

# Vedere i log
docker-compose logs -f app

# Fermare i servizi
docker-compose down
```

### Build produzione

```bash
docker build -t officina-manager .
docker run -p 3000:3000 officina-manager
```

## 🔒 Variabili d'Ambiente

Copia `.env.example` in `.env` e configura:

| Variabile | Descrizione | Default |
|-----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `NEXTAUTH_SECRET` | Secret per NextAuth (min 32 char) | - |
| `NEXTAUTH_URL` | URL applicazione | http://localhost:3000 |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | - |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | - |
| `VONAGE_API_KEY` | Vonage API Key | - |
| `MESSAGEBIRD_API_KEY` | MessageBird API Key | - |
| `COMPANY_NAME` | Nome azienda | Officina Manager |

## 👥 Ruoli e Permessi

| Ruolo | Descrizione | Permessi |
|------|-------------|----------|
| SUPER_ADMIN | Super Amministratore | Accesso completo a tutto |
| ADMIN | Amministratore | Gestione completa officina |
| MANAGER | Manager | Gestione clienti, lavori, report |
| MECHANIC | Meccanico | Visualizza e aggiorna lavori assegnati |
| RECEPTIONIST | Receptionist | Gestione clienti e appuntamenti |
| VIEWER | Visualizzatore | Solo lettura |

## 📄 Licenza

MIT License - Vedi `LICENSE` per dettagli.

## 🤝 Contribuire

1. Fork del progetto
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit le tue modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📧 Supporto

Per supporto tecnico o domande:
- Email: support@officinamanager.it
- Issues: GitHub Issues

---

**Sviluppato con ❤️ per le officine meccaniche**
