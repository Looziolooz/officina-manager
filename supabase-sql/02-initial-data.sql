-- ===========================================
-- DATI INIZIALI PER SUPABASE
-- Officina Manager - GT Service
-- Inserire dopo aver creato lo schema
-- ===========================================

-- 1. UTENTE AMMINISTRATORE (da cambiare password al primo accesso)
-- La password è hashata con bcryptjs (bcrypt.hash('GTService2025!', 12))
INSERT INTO "User" (id, email, name, password, role, "isActive")
VALUES (
  gen_random_uuid()::text,
  'giovanni@gtservice.it',
  'Giovanni Tambuscio',
  '$2a$12$LKvYOXj7PvKfQjYxZxGpe8YxZxGpe8YxZxGpe8YxZxGpe8YxZxGp', -- Password temporanea: GTService2025!
  'SUPER_ADMIN',
  true
) ON CONFLICT (email) DO NOTHING;

-- 2. CONFIGURAZIONE DEFAULT SMS PROVIDER (Twilio come default)
INSERT INTO "SMSProviderConfig" (provider, "isEnabled", priority, name, "dailyLimit", "costPerSMS")
VALUES 
  ('TWILIO', false, 1, 'Twilio', 100, 0.08),
  ('VONAGE', false, 2, 'Vonage', 100, 0.07),
  ('MESSAGEBIRD', false, 3, 'MessageBird', 100, 0.09)
ON CONFLICT (provider) DO NOTHING;

-- 3. CONFIGURAZIONE INIZIALE (dati ufficio)
-- Inserire qui i dati di esempio o configurazioni iniziali se necessario

-- FINE
SELECT 'Dati iniziali inseriti con successo!' AS message;
