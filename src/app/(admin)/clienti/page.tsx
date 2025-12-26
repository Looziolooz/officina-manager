import { getCustomersWithStatus, sendReminder } from "@/app/actions/crm";
import { Users, Phone, Mail, Car, BellRing, Check, AlertTriangle } from "lucide-react";

// 1. DEFINIZIONE TIPI (Per risolvere l'errore "implicit any")
type Vehicle = {
  id: string;
  plate: string;
  model: string;
  lastOilChange: Date | null;
  lastRevisionDate: Date | null;
};

type CustomerWithVehicles = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  vehicles: Vehicle[];
};

export default async function ClientiPage() {
  const result = await getCustomersWithStatus();
  
  // 2. CASTING SICURO DEI DATI
  const customers = result.success && result.data ? (result.data as unknown as CustomerWithVehicles[]) : [];

  // Funzione helper per calcolare giorni passati
  const getDaysDiff = (date: Date | null) => {
    if (!date) return 9999; // Mai fatto
    const diff = new Date().getTime() - new Date(date).getTime();
    return Math.floor(diff / (1000 * 3600 * 24));
  };

  return (
    <div className="space-y-8">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-orange-500" />
            Clienti & Fidelizzazione
          </h1>
          {/* 3. FIX APOSTROFO: l'anagrafica -> l&apos;anagrafica */}
          <p className="text-slate-400">Gestisci l&apos;anagrafica e invia promemoria automatici.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {customers.map((customer) => (
          <div key={customer.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all">
            
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              
              {/* Info Cliente */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-orange-500">
                  {customer.firstName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{customer.firstName} {customer.lastName}</h3>
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="flex items-center gap-2 text-sm text-slate-400">
                      <Phone className="w-3 h-3" /> {customer.phone}
                    </span>
                    <span className="flex items-center gap-2 text-sm text-slate-400">
                      <Mail className="w-3 h-3" /> {customer.email || "Nessuna email"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lista Veicoli e Scadenze */}
              <div className="flex-1 space-y-3">
                {customer.vehicles.map((vehicle) => {
                  const daysSinceOil = getDaysDiff(vehicle.lastOilChange);
                  const isOilExpired = daysSinceOil > 365; // Scaduto se > 1 anno

                  return (
                    <div key={vehicle.id} className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                      
                      <div className="flex items-center gap-3">
                        <Car className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="font-mono font-bold text-white">{vehicle.plate}</p>
                          <p className="text-xs text-slate-500">{vehicle.model}</p>
                        </div>
                      </div>

                      {/* Status Tagliando */}
                      <div className="flex items-center gap-4">
                        {isOilExpired ? (
                          <div className="flex items-center gap-2 text-red-400 bg-red-900/10 px-3 py-1 rounded-full border border-red-900/20">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs font-bold">Tagliando Scaduto</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-green-400 bg-green-900/10 px-3 py-1 rounded-full border border-green-900/20">
                            <Check className="w-4 h-4" />
                            <span className="text-xs font-bold">In Regola</span>
                          </div>
                        )}
                        
                        {/* Bottone Azione (Solo se scaduto) */}
                        {isOilExpired && (
                          <form action={async () => {
                            "use server";
                            await sendReminder(customer.id, vehicle.plate, 'TAGLIANDO');
                          }}>
                            <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                              <BellRing className="w-4 h-4" />
                              Avvisa Cliente
                            </button>
                          </form>
                        )}
                      </div>

                    </div>
                  );
                })}
                {customer.vehicles.length === 0 && (
                  <p className="text-sm text-slate-600 italic">Nessun veicolo registrato.</p>
                )}
              </div>

            </div>
          </div>
        ))}
        
        {customers.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Nessun cliente registrato. Accetta la prima auto in officina per iniziare!
          </div>
        )}
      </div>
    </div>
  );
}