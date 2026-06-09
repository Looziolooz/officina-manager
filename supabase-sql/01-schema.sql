-- ============================================
-- SCHEMA COMPLETO PER SUPABASE
-- Officina Manager - GT Service
-- Inserire questo SQL nell'Editor SQL di Supabase
-- ============================================

-- ENUMS
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'MECHANIC', 'RECEPTIONIST', 'VIEWER');
CREATE TYPE "AuditAction" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'PASSWORD_CHANGED', 'TWO_FA_ENABLED', 'TWO_FA_DISABLED', 'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED', 'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'CUSTOMER_CREATED', 'JOB_CREATED', 'INVOICE_CREATED');
CREATE TYPE "JobStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'DELIVERED', 'CANCELLED', 'PENDING');
CREATE TYPE "MaintenanceType" AS ENUM ('OIL_CHANGE', 'BRAKE_SERVICE', 'TIRE_ROTATION', 'GENERAL_INSPECTION', 'ENGINE_REPAIR', 'TRANSMISSION', 'ELECTRICAL', 'BODYWORK', 'OTHER');
CREATE TYPE "MovementType" AS ENUM ('IN', 'OUT', 'ADJUSTMENT', 'RETURN', 'TRANSFER');
CREATE TYPE "StockLevel" AS ENUM ('CRITICAL', 'LOW', 'NORMAL', 'HIGH');
CREATE TYPE "AccountingType" AS ENUM ('INCOME', 'EXPENSE', 'ADJUSTMENT');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER', 'CHECK', 'PAYPAL', 'SATISPAY', 'OTHER');
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE "ExpenseCategory" AS ENUM ('RENT', 'UTILITIES', 'INSURANCE', 'SALARIES', 'TAXES', 'PARTS_PURCHASE', 'EQUIPMENT', 'MAINTENANCE', 'FUEL', 'MARKETING', 'SERVICES', 'OTHER');
CREATE TYPE "SMSProvider" AS ENUM ('TWILIO', 'VONAGE', 'MESSAGEBIRD', 'MANUAL');
CREATE TYPE "SMSStatus" AS ENUM ('PENDING', 'SENDING', 'SENT', 'DELIVERED', 'FAILED', 'REJECTED', 'QUEUED');
CREATE TYPE "SMSType" AS ENUM ('OIL_CHANGE_REMINDER', 'INSPECTION_REMINDER', 'CAR_READY', 'APPOINTMENT_CONFIRM', 'QUOTE_READY', 'PAYMENT_REMINDER', 'MARKETING', 'CUSTOM');
CREATE TYPE "AppointmentType" AS ENUM ('DIAGNOSTIC', 'SCHEDULED_WORK', 'PICKUP', 'OTHER');
CREATE TYPE "AppointmentStatus" AS ENUM ('PLANNED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW', 'CANCELLED');
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'CONVERTED', 'EXPIRED');

-- TABELLE PRINCIPALI

-- User
CREATE TABLE "User" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password TEXT NOT NULL,
  role "Role" DEFAULT 'VIEWER',
  "isActive" BOOLEAN DEFAULT true,
  "isLocked" BOOLEAN DEFAULT false,
  "lockedUntil" TIMESTAMP,
  "loginAttempts" INTEGER DEFAULT 0,
  "lastLoginAttempt" TIMESTAMP,
  "lastLoginSuccess" TIMESTAMP,
  "lastLoginIP" VARCHAR(45),
  "passwordChangedAt" TIMESTAMP DEFAULT now(),
  "mustChangePassword" BOOLEAN DEFAULT false,
  "twoFactorEnabled" BOOLEAN DEFAULT false,
  "twoFactorSecret" TEXT,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- Session
CREATE TABLE "Session" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sessionToken" VARCHAR(255) UNIQUE NOT NULL,
  "userId" VARCHAR(36) NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL,
  "ipAddress" VARCHAR(45),
  "userAgent" TEXT,
  "createdAt" TIMESTAMP DEFAULT now()
);

-- TwoFactorBackupCode
CREATE TABLE "TwoFactorBackupCode" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" VARCHAR(36) NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  used BOOLEAN DEFAULT false,
  "usedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT now()
);

-- AuditLog
CREATE TABLE "AuditLog" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" VARCHAR(36) REFERENCES "User"(id) ON DELETE SET NULL,
  "userEmail" VARCHAR(255),
  "userName" VARCHAR(255),
  "userRole" "Role",
  action "AuditAction" NOT NULL,
  resource VARCHAR(255),
  "resourceId" VARCHAR(36),
  description TEXT,
  metadata JSONB,
  "ipAddress" VARCHAR(45),
  "userAgent" TEXT,
  "isSuccess" BOOLEAN DEFAULT true,
  "riskLevel" VARCHAR(20) DEFAULT 'LOW',
  "createdAt" TIMESTAMP DEFAULT now()
);

-- Customer
CREATE TABLE "Customer" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "firstName" VARCHAR(255) NOT NULL,
  "lastName" VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(255) UNIQUE NOT NULL,
  "alternatePhone" VARCHAR(255),
  address TEXT,
  "companyName" VARCHAR(255),
  "vatNumber" VARCHAR(255),
  "fiscalCode" VARCHAR(255),
  city VARCHAR(255),
  "postalCode" VARCHAR(20),
  province VARCHAR(10),
  country VARCHAR(10) DEFAULT 'IT',
  pec VARCHAR(255),
  "sdiCode" VARCHAR(10),
  "technicalNotes" TEXT,
  "familyNotes" TEXT,
  "totalSpent" FLOAT DEFAULT 0,
  "totalMargin" FLOAT DEFAULT 0,
  "lastVisit" TIMESTAMP,
  "smsEnabled" BOOLEAN DEFAULT true,
  "marketingSMS" BOOLEAN DEFAULT false,
  "privacyConsent" BOOLEAN DEFAULT false,
  "privacyConsentDate" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- Vehicle
CREATE TABLE "Vehicle" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  plate VARCHAR(255) UNIQUE NOT NULL,
  brand VARCHAR(255) NOT NULL,
  "modelName" VARCHAR(255) NOT NULL,
  year INTEGER NOT NULL,
  vin VARCHAR(255),
  "engineSize" VARCHAR(50),
  "fuelType" VARCHAR(50),
  "totalKm" INTEGER DEFAULT 0,
  "lastOilChange" INTEGER,
  "lastOilChangeDate" TIMESTAMP,
  "lastInspection" TIMESTAMP,
  "nextOilChange" INTEGER,
  "nextOilChangeDate" TIMESTAMP,
  "nextInspection" TIMESTAMP,
  "oilChangeReminders" BOOLEAN DEFAULT true,
  "inspectionReminders" BOOLEAN DEFAULT true,
  "ownerId" VARCHAR(36) NOT NULL REFERENCES "Customer"(id),
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- Job
CREATE TABLE "Job" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "jobNumber" VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status "JobStatus" DEFAULT 'SCHEDULED',
  priority INTEGER DEFAULT 0,
  "scheduledDate" TIMESTAMP NOT NULL,
  "startedAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "deliveredAt" TIMESTAMP,
  "estimatedDuration" INTEGER,
  "vehicleId" VARCHAR(36) NOT NULL REFERENCES "Vehicle"(id),
  "customerId" VARCHAR(36) NOT NULL REFERENCES "Customer"(id),
  "kmAtEntry" INTEGER NOT NULL,
  "fuelLevel" INTEGER DEFAULT 0,
  "laborHours" FLOAT DEFAULT 0,
  "laborRate" FLOAT DEFAULT 45,
  "laborCost" FLOAT DEFAULT 0,
  "partsCost" FLOAT DEFAULT 0,
  "totalAmount" FLOAT DEFAULT 0,
  margin FLOAT DEFAULT 0,
  "maintenanceType" "MaintenanceType",
  "assignedToId" VARCHAR(36) REFERENCES "User"(id),
  "readySMSSent" BOOLEAN DEFAULT false,
  "readySMSSentAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- Part
CREATE TABLE "Part" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(255) DEFAULT 'GENERIC',
  brand VARCHAR(255),
  "buyPrice" FLOAT DEFAULT 0,
  "sellPrice" FLOAT DEFAULT 0,
  markup FLOAT DEFAULT 30,
  stock INTEGER DEFAULT 0,
  "minStock" INTEGER DEFAULT 5,
  "maxStock" INTEGER DEFAULT 50,
  "reorderPoint" INTEGER DEFAULT 10,
  "stockLevel" "StockLevel" DEFAULT 'NORMAL',
  location VARCHAR(255),
  barcode VARCHAR(255) UNIQUE,
  "supplierCode" VARCHAR(255),
  "supplierName" VARCHAR(255),
  "totalValue" FLOAT DEFAULT 0,
  "lastPurchasePrice" FLOAT,
  "lastPurchaseDate" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- JobPhoto
CREATE TABLE "JobPhoto" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "jobId" VARCHAR(36) NOT NULL REFERENCES "Job"(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  "photoType" VARCHAR(50) DEFAULT 'GENERAL',
  description TEXT,
  "createdAt" TIMESTAMP DEFAULT now()
);

-- JobNote
CREATE TABLE "JobNote" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "jobId" VARCHAR(36) NOT NULL REFERENCES "Job"(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  "noteType" VARCHAR(50) DEFAULT 'GENERAL',
  "authorId" VARCHAR(36) NOT NULL REFERENCES "User"(id),
  "createdAt" TIMESTAMP DEFAULT now()
);

-- PartOnJob
CREATE TABLE "PartOnJob" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "jobId" VARCHAR(36) NOT NULL REFERENCES "Job"(id) ON DELETE CASCADE,
  "partId" VARCHAR(36) NOT NULL REFERENCES "Part"(id),
  quantity INTEGER DEFAULT 1,
  "appliedPrice" FLOAT NOT NULL,
  discount FLOAT DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT now(),
  UNIQUE ("jobId", "partId")
);

-- StockMovement
CREATE TABLE "StockMovement" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "movementNumber" VARCHAR(255) UNIQUE NOT NULL,
  type "MovementType" NOT NULL,
  "partId" VARCHAR(36) NOT NULL REFERENCES "Part"(id),
  quantity INTEGER NOT NULL,
  "unitPrice" FLOAT DEFAULT 0,
  "totalValue" FLOAT DEFAULT 0,
  "jobId" VARCHAR(36) REFERENCES "Job"(id),
  "documentNumber" VARCHAR(255),
  "stockBefore" INTEGER NOT NULL,
  "stockAfter" INTEGER NOT NULL,
  notes TEXT,
  reason TEXT,
  "performedById" VARCHAR(36) NOT NULL REFERENCES "User"(id),
  "createdAt" TIMESTAMP DEFAULT now()
);

-- StockAlert
CREATE TABLE "StockAlert" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "partId" VARCHAR(36) NOT NULL REFERENCES "Part"(id) ON DELETE CASCADE,
  "alertType" VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'WARNING',
  "isRead" BOOLEAN DEFAULT false,
  "readAt" TIMESTAMP,
  "readById" VARCHAR(36),
  "createdAt" TIMESTAMP DEFAULT now()
);

-- Invoice
CREATE TABLE "Invoice" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "invoiceNumber" VARCHAR(255) UNIQUE NOT NULL,
  year INTEGER NOT NULL,
  number INTEGER NOT NULL,
  status "InvoiceStatus" DEFAULT 'DRAFT',
  "issueDate" TIMESTAMP DEFAULT now(),
  "dueDate" TIMESTAMP NOT NULL,
  "paidDate" TIMESTAMP,
  "customerId" VARCHAR(36) NOT NULL REFERENCES "Customer"(id),
  "jobId" VARCHAR(36) UNIQUE REFERENCES "Job"(id),
  subtotal FLOAT DEFAULT 0,
  "taxRate" FLOAT DEFAULT 22,
  "taxAmount" FLOAT DEFAULT 0,
  total FLOAT DEFAULT 0,
  "amountPaid" FLOAT DEFAULT 0,
  "amountDue" FLOAT DEFAULT 0,
  "paymentMethod" "PaymentMethod",
  notes TEXT,
  "internalNotes" TEXT,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- InvoiceItem
CREATE TABLE "InvoiceItem" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "invoiceId" VARCHAR(36) NOT NULL REFERENCES "Invoice"(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity FLOAT DEFAULT 1,
  "unitPrice" FLOAT NOT NULL,
  discount FLOAT DEFAULT 0,
  "vatRate" FLOAT DEFAULT 22,
  subtotal FLOAT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT now()
);

-- Expense
CREATE TABLE "Expense" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "expenseNumber" VARCHAR(255),
  category "ExpenseCategory" NOT NULL,
  description TEXT NOT NULL,
  amount FLOAT NOT NULL,
  "taxAmount" FLOAT DEFAULT 0,
  "totalAmount" FLOAT NOT NULL,
  "expenseDate" TIMESTAMP DEFAULT now(),
  "dueDate" TIMESTAMP,
  "paidDate" TIMESTAMP,
  "isPaid" BOOLEAN DEFAULT false,
  "paymentMethod" "PaymentMethod",
  "supplierName" VARCHAR(255) NOT NULL,
  "supplierVAT" VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- AccountingRecord
CREATE TABLE "AccountingRecord" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "recordNumber" VARCHAR(255) UNIQUE NOT NULL,
  type "AccountingType" NOT NULL,
  date TIMESTAMP DEFAULT now(),
  amount FLOAT NOT NULL,
  "totalAmount" FLOAT NOT NULL,
  category VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  "invoiceId" VARCHAR(36) UNIQUE REFERENCES "Invoice"(id),
  "expenseId" VARCHAR(36) UNIQUE REFERENCES "Expense"(id),
  "jobId" VARCHAR(36) REFERENCES "Job"(id),
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- SMSMessage
CREATE TABLE "SMSMessage" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "phoneNumber" VARCHAR(255) NOT NULL,
  "customerId" VARCHAR(36) REFERENCES "Customer"(id),
  message TEXT NOT NULL,
  type "SMSType" NOT NULL,
  provider "SMSProvider" NOT NULL,
  status "SMSStatus" DEFAULT 'PENDING',
  "providerMessageId" VARCHAR(255),
  attempts INTEGER DEFAULT 0,
  "maxAttempts" INTEGER DEFAULT 3,
  "lastAttemptAt" TIMESTAMP,
  cost FLOAT,
  "creditsUsed" FLOAT,
  "scheduledFor" TIMESTAMP,
  "sentAt" TIMESTAMP,
  "deliveredAt" TIMESTAMP,
  "failedAt" TIMESTAMP,
  "errorMessage" TEXT,
  "providerResponse" TEXT,
  "vehicleId" VARCHAR(36) REFERENCES "Vehicle"(id),
  "jobId" VARCHAR(36) REFERENCES "Job"(id),
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- SMSProviderConfig
CREATE TABLE "SMSProviderConfig" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  provider "SMSProvider" UNIQUE NOT NULL,
  "isEnabled" BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  name VARCHAR(255) NOT NULL,
  "dailyLimit" INTEGER DEFAULT 100,
  "messagesSentToday" INTEGER DEFAULT 0,
  "costPerSMS" FLOAT DEFAULT 0.08,
  "remainingCredits" FLOAT DEFAULT 0,
  "lastUsedAt" TIMESTAMP,
  "successRate" FLOAT DEFAULT 100,
  "totalSent" INTEGER DEFAULT 0,
  "totalFailed" INTEGER DEFAULT 0,
  "lastResetDate" TIMESTAMP DEFAULT now(),
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- Appointment (FASE 1)
CREATE TABLE "Appointment" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "startAt" TIMESTAMP NOT NULL,
  "endAt" TIMESTAMP NOT NULL,
  type "AppointmentType" DEFAULT 'SCHEDULED_WORK',
  status "AppointmentStatus" DEFAULT 'PLANNED',
  notes TEXT,
  "customerId" VARCHAR(36) REFERENCES "Customer"(id),
  "vehicleId" VARCHAR(36) REFERENCES "Vehicle"(id),
  "jobId" VARCHAR(36) UNIQUE REFERENCES "Job"(id),
  "walkInName" VARCHAR(255),
  "walkInPhone" VARCHAR(255),
  "walkInPlate" VARCHAR(255),
  "reminderDayBeforeSent" BOOLEAN DEFAULT false,
  "reminderDayBeforeSentAt" TIMESTAMP,
  "reminderSameDaySent" BOOLEAN DEFAULT false,
  "reminderSameDaySentAt" TIMESTAMP,
  "createdById" VARCHAR(36) NOT NULL REFERENCES "User"(id),
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- Quote (FASE 5)
CREATE TABLE "Quote" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "quoteNumber" VARCHAR(255) UNIQUE NOT NULL,
  year INTEGER NOT NULL,
  number INTEGER NOT NULL,
  status "QuoteStatus" DEFAULT 'DRAFT',
  "issueDate" TIMESTAMP DEFAULT now(),
  "validUntil" TIMESTAMP NOT NULL,
  "customerId" VARCHAR(36) NOT NULL REFERENCES "Customer"(id),
  "vehicleId" VARCHAR(36) NOT NULL REFERENCES "Vehicle"(id),
  km INTEGER,
  "workDescription" TEXT,
  disclaimer TEXT,
  "laborHours" FLOAT DEFAULT 0,
  "laborRate" FLOAT DEFAULT 45,
  subtotal FLOAT DEFAULT 0,
  "taxRate" FLOAT DEFAULT 22,
  "taxAmount" FLOAT DEFAULT 0,
  total FLOAT DEFAULT 0,
  "convertedJobId" VARCHAR(36) UNIQUE REFERENCES "Job"(id),
  "convertedInvoiceId" VARCHAR(36) UNIQUE REFERENCES "Invoice"(id),
  "createdById" VARCHAR(36) NOT NULL REFERENCES "User"(id),
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- QuoteItem
CREATE TABLE "QuoteItem" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "quoteId" VARCHAR(36) NOT NULL REFERENCES "Quote"(id) ON DELETE CASCADE,
  "partId" VARCHAR(36) REFERENCES "Part"(id),
  description TEXT NOT NULL,
  "isPartProvidedByCustomer" BOOLEAN DEFAULT false,
  quantity FLOAT DEFAULT 1,
  "unitPrice" FLOAT NOT NULL,
  discount FLOAT DEFAULT 0,
  "vatRate" FLOAT DEFAULT 22,
  subtotal FLOAT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT now()
);

-- SupplierDelivery (FASE 4)
CREATE TABLE "SupplierDelivery" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "supplierName" VARCHAR(255) NOT NULL,
  "documentNumber" VARCHAR(255) NOT NULL,
  "listNumber" VARCHAR(255),
  "deliveryDate" TIMESTAMP NOT NULL,
  "totalAmount" FLOAT NOT NULL,
  "taxAmount" FLOAT NOT NULL,
  notes TEXT,
  "pdfUrl" TEXT,
  "importedById" VARCHAR(36) NOT NULL REFERENCES "User"(id),
  "createdAt" TIMESTAMP DEFAULT now(),
  UNIQUE ("supplierName", "documentNumber")
);

-- SMS Campaign (FASE 7)
CREATE TABLE "SMSCampaign" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  "scheduledFor" TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'DRAFT',
  "targetAllCustomers" BOOLEAN DEFAULT false,
  "targetCustomerIds" TEXT[],
  "targetMinTotalSpent" FLOAT,
  "targetVehicleFuelType" VARCHAR(50),
  "totalSent" INTEGER DEFAULT 0,
  "totalDelivered" INTEGER DEFAULT 0,
  "totalFailed" INTEGER DEFAULT 0,
  "createdById" VARCHAR(36) NOT NULL REFERENCES "User"(id),
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- WasteRecord (FASE 9)
CREATE TABLE "WasteRecord" (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type VARCHAR(255) NOT NULL,
  quantity FLOAT NOT NULL,
  unit VARCHAR(10) NOT NULL,
  "movementType" VARCHAR(20) NOT NULL,
  date TIMESTAMP DEFAULT now(),
  "documentNumber" VARCHAR(255),
  "carrierName" VARCHAR(255),
  notes TEXT,
  "recordedById" VARCHAR(36) NOT NULL REFERENCES "User"(id),
  "createdAt" TIMESTAMP DEFAULT now()
);

-- INDICI (INDEXES)
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_customer_phone ON "Customer"(phone);
CREATE INDEX idx_customer_lastname ON "Customer"("lastName");
CREATE INDEX idx_vehicle_plate ON "Vehicle"(plate);
CREATE INDEX idx_job_status ON "Job"(status);
CREATE INDEX idx_job_vehicleId ON "Job"("vehicleId");
CREATE INDEX idx_job_customerId ON "Job"("customerId");
CREATE INDEX idx_stockmovement_partId ON "StockMovement"("partId");
CREATE INDEX idx_stockmovement_type ON "StockMovement"(type);
CREATE INDEX idx_invoice_status ON "Invoice"(status);
CREATE INDEX idx_invoice_issueDate ON "Invoice"("issueDate");
CREATE INDEX idx_sms_message_status ON "SMSMessage"(status);
CREATE INDEX idx_sms_message_type ON "SMSMessage"(type);
CREATE INDEX idx_sms_message_customerId ON "SMSMessage"("customerId");
CREATE INDEX idx_appointment_startAt ON "Appointment"("startAt");
CREATE INDEX idx_appointment_status ON "Appointment"(status);
CREATE INDEX idx_auditlog_userId ON "AuditLog"("userId");
CREATE INDEX idx_auditlog_action ON "AuditLog"(action);
CREATE INDEX idx_auditlog_createdAt ON "AuditLog"("createdAt");
CREATE INDEX idx_part_category ON "Part"(category);
CREATE INDEX idx_part_stockLevel ON "Part"("stockLevel");
CREATE INDEX idx_accountingrecord_type ON "AccountingRecord"(type);
CREATE INDEX idx_accountingrecord_date ON "AccountingRecord"(date);
CREATE INDEX idx_smsmessage_scheduledFor ON "SMSMessage"("scheduledFor");

-- RELAZIONI INVERSE (da aggiungere separatamente in Supabase)
-- Queste sono gestite da Prisma, ma puoi aggiungerle manualmente:
-- User.assignments, Customer.vehicles, Customer.jobs, Customer.appointments, etc.
-- Saranno create automaticamente quando usi Prisma con il schema completo.

-- FINE
SELECT 'Schema creato con successo!' AS message;
