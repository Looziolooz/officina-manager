# TODOS

Deferred work, with enough context to pick it up cold.

## Dashboard

### T1 — Unit test per i calcoli della dashboard — P2 (facile)
**Cosa:** test per `getRevenueSplit` (split manodopera/ricambi) e per il calcolo del delta margine in `getDashboardKPIs` ([src/app/actions/dashboard.ts](src/app/actions/dashboard.ts)).
**Perché:** sono calcoli che alimentano numeri mostrati al titolare; una regressione passerebbe inosservata.
**Dove iniziare:** Jest è già configurato (`jest.config.js`). Mockare `prisma` e verificare: split con 0 dati → `{labor:0, parts:0}`; delta margine con `yesterdayMargin=0` → `0` (no divisione per zero).
**Dipende da:** niente.

### T2 — Eliminare N+1 nei Top widget — P3 (facile)
**Cosa:** in `getTopParts` e `getTopCustomers` ([src/app/actions/dashboard.ts](src/app/actions/dashboard.ts)) si fa una `findUnique` dentro un `map` (una query per riga).
**Perché:** con limit=5 sono ~10 query extra, irrilevante oggi; diventa un problema se si alza il limite o cresce il traffico.
**Dove iniziare:** sostituire con un'unica `findMany({ where: { id: { in: ids } } })` e ricomporre i risultati con una `Map`.
**Dipende da:** niente.

### T3 — Snapshot storici per trend reali (auto in officina, valore magazzino) — P3 (medio)
**Cosa:** oggi le frecce "delta" per "Auto in Officina" e "Valore Magazzino" sono state rimosse perché non abbiamo uno storico. Per mostrarle vere serve salvare un'istantanea giornaliera.
**Perché:** dà al titolare i trend reali ("magazzino +3% questo mese") oggi impossibili.
**Dove iniziare:** nuova tabella `DashboardSnapshot` (data, carsInWorkshop, warehouseValue, ...) + job giornaliero (cron) che la popola; poi calcolare i delta confrontando con lo snapshot precedente.
**Dipende da:** scelta di uno scheduler (cron/queue).

## Login / Auth

### T4 — (Promemoria) Build rotto su /admin/users — P1 (da indagare)
**Cosa:** `npm run build` fallisce con "Failed to collect page data for /admin/users" (pre-esistente, non legato alle modifiche dashboard/login).
**Perché:** blocca i deploy di produzione.
**Dove iniziare:** controllare accessi a DB/`headers()`/env mancanti durante il prerender della pagina `/admin/users`.
