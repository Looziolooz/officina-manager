import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Phone, Mail, Car, Wrench, Users, History, TrendingUp, DollarSign } from "lucide-react";
import NoteEditor from "@/components/admin/NoteEditor";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      vehicles: {
        include: { jobs: { orderBy: { createdAt: "desc" }, take: 5 } }
      }
    }
  });

  if (!customer) notFound();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      
      {/* A) Header Card */}
      <div className="bg-linear-to-r from-slate-900 to-slate-950 border border-white/10 p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-white tracking-tight">{customer.firstName} {customer.lastName}</h1>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                Gold Member
              </span>
            </div>
            <div className="flex gap-6 text-gray-400">
              <a href={`tel:${customer.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone size={18} className="text-primary" /> {customer.phone}
              </a>
              {customer.email && (
                <a href={`mailto:${customer.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail size={18} className="text-primary" /> {customer.email}
                </a>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
             <Link 
                href={`/admin/customers/${customer.id}/edit`}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center"
             >
                Modifica Profilo
             </Link>
          </div>
        </div>
      </div>

      {/* B) Statistiche Finanziarie */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2 text-gray-400">
            <DollarSign size={20} className="text-green-500" />
            <span className="text-xs uppercase tracking-widest font-bold">Totale Speso</span>
          </div>
          <p className="text-3xl font-mono font-bold text-green-400">€ {customer.totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2 text-gray-400">
            <TrendingUp size={20} className="text-blue-500" />
            <span className="text-xs uppercase tracking-widest font-bold">Margine Totale</span>
          </div>
          <p className="text-3xl font-mono font-bold text-blue-400">€ {customer.totalMargin.toFixed(2)}</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2 text-gray-400">
            <History size={20} className="text-purple-500" />
            <span className="text-xs uppercase tracking-widest font-bold">Interventi</span>
          </div>
          <p className="text-3xl font-mono font-bold text-purple-400">
            {customer.vehicles.reduce((acc, v) => acc + v.jobs.length, 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* D & E) Note CRM Avanzate */}
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Car className="text-primary" /> Parco Veicoli
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.vehicles.map(vehicle => (
                <div key={vehicle.id} className="bg-slate-900 border border-white/10 p-5 rounded-2xl group hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-white text-black font-mono font-bold px-3 py-1 rounded text-lg border-2 border-gray-300 shadow-sm">
                      {vehicle.plate}
                    </div>
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                      {vehicle.year}
                    </span>
                  </div>
                  <p className="text-white font-bold text-lg">{vehicle.brand} {vehicle.model}</p>
                  <p className="text-sm text-gray-500 mb-4">VIN: {vehicle.vin || 'N/D'} • {vehicle.fuelType || 'N/D'}</p>
                  <button className="w-full py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-sm font-bold transition-all cursor-pointer">
                    Nuovo Intervento
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NoteEditor 
              customerId={customer.id} 
              type="technical" 
              initialContent={customer.technicalNotes} 
              icon={<Wrench size={18} />}
              title="Note Tecniche"
              colorClass="blue"
            />
            <NoteEditor 
              customerId={customer.id} 
              type="family" 
              initialContent={customer.familyNotes} 
              icon={<Users size={18} />}
              title="Note Ufficio"
              colorClass="orange"
            />
          </section>
        </div>

        {/* F) Storico Interventi */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl h-fit">
          <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest">Ultimi Lavori</h3>
          <div className="space-y-6 relative border-l border-white/10 ml-3 pl-6">
            {customer.vehicles.flatMap(v => v.jobs).map(job => (
              <div key={job.id} className="relative">
                <div className="absolute -left-7.5 -translate-x-px top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-slate-900" />
                <p className="text-xs text-gray-500 mb-1">
                  {job.createdAt.toLocaleDateString('it-IT')}
                </p>
                <h4 className="text-white font-bold text-sm">{job.title}</h4>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/20">
                    {job.status}
                  </span>
                  <span className="font-mono text-sm font-bold">€ {job.totalAmount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}