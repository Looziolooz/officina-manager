import Link from "next/link";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Impostazioni Sistema</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* General Settings */}
        <Link href="/admin/settings/general" className="block">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-lg font-medium mb-2">Generali</h3>
            <p className="text-sm text-gray-600">
              Gestisci i dati della tua azienda, logo e informazioni fiscali
            </p>
          </div>
        </Link>

        {/* SMS Templates */}
        <Link href="/admin/settings/sms" className="block">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-lg font-medium mb-2">Template SMS</h3>
            <p className="text-sm text-gray-600">
              Configura i messaggi automatici per reminder, notifiche e marketing
            </p>
          </div>
        </Link>

        {/* SMS Providers */}
        <Link href="/admin/settings/sms-providers" className="block">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-lg font-medium mb-2">Provider SMS</h3>
            <p className="text-sm text-gray-600">
              Configura Twilio, Vonage, MessageBird o altri provider SMS
            </p>
          </div>
        </Link>

        {/* Security */}
        <Link href="/admin/settings/security" className="block">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-lg font-medium mb-2">Sicurezza</h3>
            <p className="text-sm text-gray-600">
              Gestisci password policy, 2FA obbligatorio e sessioni utenti
            </p>
          </div>
        </Link>

        {/* Notifications */}
        <Link href="/admin/settings/notifications" className="block">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-lg font-medium mb-2">Notifiche</h3>
            <p className="text-sm text-gray-600">
              Imposta regole per avvisi scorte magazzino, scadenze e promemoria
            </p>
          </div>
        </Link>

        {/* Backup */}
        <Link href="/admin/settings/backup" className="block">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-lg font-medium mb-2">Backup & Export</h3>
            <p className="text-sm text-gray-600">
              Esporta dati, backup database e configurazione sistema
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
