# 📘 API Documentation - Officina Manager

## Overview

Le API di Officina Manager sono basate su Next.js App Router con Route Handlers. Tutte le API seguono il pattern REST e restituiscono JSON.

**Base URL:** `http://localhost:3000/api`

---

## 🔐 Authentication

La maggior parte delle API richiede autenticazione tramite NextAuth.js v5.

**Headers richiesti:**
```
Authorization: Bearer <token>  # Per API che lo richiedono
Cookie: next-auth.session-token  # Sessione web
```

---

## 📂 Customers API

### GET /api/customers/search
Cerca clienti per nome, cognome, telefono o targa.

**Query Parameters:**
- `q` (string, required): Query di ricerca

**Response:**
```json
[
  {
    "id": "uuid",
    "firstName": "Mario",
    "lastName": "Rossi",
    "email": "mario@example.com",
    "phone": "+391234567890",
    "vehicles": [
      {
        "id": "uuid",
        "plate": "AB123CD",
        "brand": "Fiat",
        "modelName": "Panda"
      }
    ]
  }
]
```

### POST /api/customers
Crea un nuovo cliente (con veicolo opzionale).

**Request Body:**
```json
{
  "firstName": "Mario",
  "lastName": "Rossi",
  "phone": "+391234567890",
  "email": "mario@example.com",
  "plate": "AB123CD",
  "brand": "Fiat",
  "model": "Panda"
}
```

**Response:**
```json
{
  "success": true,
  "customerId": "uuid",
  "vehicleId": "uuid"
}
```

### GET /api/customers/[id]
Ottiene i dettagli di un cliente specifico.

**Response:**
```json
{
  "id": "uuid",
  "firstName": "Mario",
  "lastName": "Rossi",
  "email": "mario@example.com",
  "phone": "+391234567890",
  "totalSpent": 1500.50,
  "vehicles": [...],
  "jobs": [...],
  "invoices": [...]
}
```

---

## 🚗️ Vehicles API

### GET /api/vehicles/search
Cerca veicoli per targa.

**Query Parameters:**
- `q` (string, required): Targa o parte di essa

**Response:**
```json
[
  {
    "id": "uuid",
    "plate": "AB123CD",
    "brand": "Fiat",
    "modelName": "Panda",
    "year": 2020,
    "owner": {
      "id": "uuid",
      "firstName": "Mario",
      "lastName": "Rossi"
    }
  }
]
```

---

## 🔧 Jobs API

### GET /api/jobs
Lista lavori con filtri opzionali.

**Query Parameters:**
- `status` (string, optional): Filtra per stato (SCHEDULED, IN_PROGRESS, etc.)
- `customerId` (string, optional): Filtra per cliente
- `assignedToId` (string, optional): Filtra per meccanico assegnato

**Response:**
```json
[
  {
    "id": "uuid",
    "jobNumber": "JOB-2024-0001",
    "title": "Cambio olio",
    "status": "IN_PROGRESS",
    "scheduledDate": "2024-12-01T08:00:00Z",
    "customer": { ... },
    "vehicle": { ... },
    "assignedTo": { ... }
  }
]
```

### POST /api/jobs
Crea un nuovo lavoro.

**Request Body:**
```json
{
  "title": "Cambio olio",
  "vehicleId": "uuid",
  "scheduledDate": "2024-12-01T08:00:00Z",
  "kmAtEntry": 50000,
  "maintenanceType": "OIL_CHANGE"
}
```

### PATCH /api/jobs/[id]
Aggiorna lo stato di un lavoro.

**Request Body:**
```json
{
  "status": "COMPLETED",
  "completedAt": "2024-12-01T10:30:00Z"
}
```

---

## 💰 Invoices API

### GET /api/invoices
Lista fatture.

**Query Parameters:**
- `status` (string, optional): Filtra per stato (DRAFT, ISSUED, PAID, etc.)
- `customerId` (string, optional): Filtra per cliente

**Response:**
```json
[
  {
    "id": "uuid",
    "invoiceNumber": "INV-2024-0001",
    "status": "PAID",
    "issueDate": "2024-12-01",
    "total": 350.00,
    "paidDate": "2024-12-05",
    "customer": { ... }
  }
]
```

### POST /api/invoices
Crea una nuova fattura.

**Request Body:**
```json
{
  "customerId": "uuid",
  "jobId": "uuid",
  "dueDate": "2024-12-31",
  "items": [
    {
      "description": "Olio motore",
      "quantity": 1,
      "unitPrice": 50.00,
      "vatRate": 22
    }
  ]
}
```

### GET /api/invoices/[id]
Ottiene i dettagli di una fattura.

**Response:**
```json
{
  "id": "uuid",
  "invoiceNumber": "INV-2024-0001",
  "status": "ISSUED",
  "subtotal": 450.00,
  "taxAmount": 99.00,
  "total": 549.00,
  "items": [...],
  "customer": { ... }
}
```

---

## 📦 Inventory API

### GET /api/inventory
Lista articoli in magazzino.

**Query Parameters:**
- `category` (string, optional): Filtra per categoria
- `stockLevel` (string, optional): CRITICAL, LOW, NORMAL, HIGH

**Response:**
```json
[
  {
    "id": "uuid",
    "code": "OIL-001",
    "name": "Olio 5W40",
    "stock": 25,
    "sellPrice": 45.00,
    "stockLevel": "NORMAL"
  }
]
```

### POST /api/inventory
Aggiunge un nuovo articolo.

**Request Body:**
```json
{
  "code": "OIL-001",
  "name": "Olio 5W40",
  "category": "OIL",
  "buyPrice": 30.00,
  "sellPrice": 45.00,
  "stock": 50,
  "minStock": 10
}
```

### POST /api/inventory/movement
Registra un movimento di magazzino.

**Request Body:**
```json
{
  "partId": "uuid",
  "type": "OUT",
  "quantity": 2,
  "jobId": "uuid",
  "reason": "Utilizzo per lavoro"
}
```

---

## 📅 Appointments API

### GET /api/appointments
Lista appuntamenti.

**Query Parameters:**
- `startDate` (string): Data inizio (ISO 8601)
- `endDate` (string): Data fine (ISO 8601)
- `status` (string): PLANNED, CONFIRMED, COMPLETED, etc.

**Response:**
```json
[
  {
    "id": "uuid",
    "startAt": "2024-12-01T08:00:00Z",
    "endAt": "2024-12-01T10:00:00Z",
    "type": "SCHEDULED_WORK",
    "status": "CONFIRMED",
    "customer": { ... },
    "vehicle": { ... }
  }
]
```

### POST /api/appointments
Crea un nuovo appuntamento.

**Request Body:**
```json
{
  "startAt": "2024-12-01T08:00:00Z",
  "endAt": "2024-12-01T10:00:00Z",
  "customerId": "uuid",
  "vehicleId": "uuid",
  "type": "SCHEDULED_WORK"
}
```

---

## 📊 Accounting API

### GET /api/accounting/records
Lista movimenti contabili.

**Query Parameters:**
- `type` (string): INCOME, EXPENSE, ADJUSTMENT
- `startDate` (string): Data inizio
- `endDate` (string): Data fine

**Response:**
```json
[
  {
    "id": "uuid",
    "recordNumber": "ACC-2024-0001",
    "type": "INCOME",
    "amount": 350.00,
    "totalAmount": 427.00,
    "date": "2024-12-01",
    "description": "Fattura INV-2024-0001"
  }
]
```

### POST /api/accounting/expenses
Registra una nuova spesa.

**Request Body:**
```json
{
  "category": "PARTS_PURCHASE",
  "description": "Acquisto olii",
  "amount": 300.00,
  "taxAmount": 66.00,
  "expenseDate": "2024-12-01",
  "supplierName": "Forniture Auto SRL"
}
```

---

## 💬 SMS API

### GET /api/sms/messages
Lista messaggi SMS inviati.

**Query Parameters:**
- `status` (string): PENDING, SENT, DELIVERED, FAILED
- `type` (string): OIL_CHANGE_REMINDER, CAR_READY, etc.

**Response:**
```json
[
  {
    "id": "uuid",
    "phoneNumber": "+391234567890",
    "message": "Ciao Mario, la tua auto è pronta!",
    "type": "CAR_READY",
    "status": "DELIVERED",
    "sentAt": "2024-12-01T10:00:00Z"
  }
]
```

### POST /api/sms/send
Invia un SMS personalizzato.

**Request Body:**
```json
{
  "phoneNumber": "+391234567890",
  "message": "Promemoria: appuntamento domani alle 8:00",
  "type": "APPOINTMENT_REMINDER"
}
```

---

## 🔐 Error Responses

Tutte le API restituiscono errori in questo formato:

```json
{
  "success": false,
  "message": "Descrizione errore",
  "error": { ... }  // Dettagli aggiuntivi (opzionale)
}
```

**Codici di stato HTTP:**
- `200` - Successo
- `201` - Creato con successo
- `400` - Richiesta non valida
- `401` - Non autenticato
- `403` - Non autorizzato
- `404` - Non trovato
- `500` - Errore server

---

## 📝 Esempi di Utilizzo

### cURL

```bash
# Cerca cliente
curl "http://localhost:3000/api/customers/search?q=Mario"

# Crea nuovo lavoro
curl -X POST "http://localhost:3000/api/jobs" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cambio olio",
    "vehicleId": "uuid",
    "scheduledDate": "2024-12-01T08:00:00Z"
  }'
```

### JavaScript/TypeScript

```typescript
// Fetch clients
const response = await fetch('/api/customers/search?q=Mario');
const customers = await response.json();

// Create job
const job = await fetch('/api/jobs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Cambio olio',
    vehicleId: 'uuid',
    scheduledDate: new Date().toISOString(),
  }),
});
```

---

## 🔗 Related Links

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js](https://authjs.dev/)
