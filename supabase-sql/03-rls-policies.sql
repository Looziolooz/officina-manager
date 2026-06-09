-- ===========================================
-- ROW LEVEL SECURITY (RLS) POLICIES PER SUPABASE
-- Eseguire solo se si vuole usare le RLS di Supabase
-- ===========================================

-- Abilita RLS su tutte le tabelle principali
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vehicle" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Job" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Part" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Quote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SMSMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StockMovement" ENABLE ROW LEVEL SECURITY;

-- Esempio policy: Allow authenticated users full access (personalizzare secondo necessità)
CREATE POLICY "Allow authenticated access on users" ON "User" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access on customers" ON "Customer" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access on vehicles" ON "Vehicle" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access on jobs" ON "Job" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access on parts" ON "Part" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access on invoices" ON "Invoice" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access on appointments" ON "Appointment" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access on quotes" ON "Quote" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access on sms_messages" ON "SMSMessage" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access on stock_movements" ON "StockMovement" FOR ALL USING (auth.role() = 'authenticated');

-- FINE
SELECT 'RLS policies create con successo!' AS message;
