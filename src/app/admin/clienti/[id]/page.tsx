import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  Phone, Mail, ArrowLeft, History, Save, FileText
} from "lucide-react"; 
import { updateCustomerNotes } from "@/app/actions/workshop";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerProfilePage({ params }: PageProps) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      vehicles: {
        include: {
          jobs: {
            orderBy: { createdAt: 'desc' },
            include: {
              items: { include: { part: true } }
            }
          }
        }
      }
    }
  });

  if (!customer) notFound();

  const allJobs = customer.vehicles.flatMap(v => 
    v.jobs.map(j => ({ 
      ...j, 
      vehiclePlate: v.plate, 
      vehicleModel: v.model 
    }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalSpent = allJobs.reduce((acc, job) => acc + (job.totalCost || 0), 0);
  const totalPartsCost = allJobs.reduce((acc, job) => acc + (job.partsCost || 0), 0);
  const totalLaborCost = allJobs.reduce((acc, job) => acc + (job.laborCost || 0), 0);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/clienti" className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{customer.firstName} {customer.lastName}</h1>
            <p className="text-slate-400 text-sm">Kund sedan {new Date(customer.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">info cliente</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-300 p-3 bg-slate-950 rounded-lg border border-slate-800">
                <Phone className="w-4 h-4 text-blue-400" />
                <span className="font-mono">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300 p-3 bg-slate-950 rounded-lg border border-slate-800">
                <Mail className="w-4 h-4 text-purple-400" />
                <span className="truncate">{customer.email || "Ingen e-post"}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-white tracking-tight">Note aggiuntive</h3>
            </div>
            <form action={async (formData) => {
              "use server";
              const notes = formData.get("notes") as string;
              await updateCustomerNotes(id, "", notes);
            }}>
              <textarea 
                name="notes"
                defaultValue={customer.notes || ""}
                placeholder="Anteckningar om kunden..."
                className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 focus:border-orange-500 outline-none resize-none mb-3"
              />
              <button className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                <Save className="w-4 h-4" /> Spara anteckningar
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <p className="text-xs uppercase font-black text-white">Total kostnad</p>
              <p className="text-2xl font-black text-white mt-1">€ {totalSpent.toFixed(2)}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <p className="text-xs uppercase font-black text-blue-500">Reservdelar</p>
              <p className="text-2xl font-black text-blue-400 mt-1">€ {totalPartsCost.toFixed(2)}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <p className="text-xs uppercase font-black text-orange-500">Arbete</p>
              <p className="text-2xl font-black text-orange-400 mt-1">€ {totalLaborCost.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" />
              <h3 className="font-bold text-white tracking-tight">Storico</h3>
            </div>
            <div className="divide-y divide-slate-800">
              {allJobs.map((job) => (
                <div key={job.id} className="p-6 hover:bg-slate-800/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-orange-500 font-mono font-bold tracking-tighter">{job.vehiclePlate}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-300 font-medium text-sm">{job.vehicleModel}</span>
                      </div>
                      <p className="text-white font-medium uppercase text-sm mt-1">{job.description}</p>
                      <p className="text-xs text-slate-500 mt-2">{new Date(job.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className="text-xl font-black text-white leading-none">€ {job.totalCost?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}