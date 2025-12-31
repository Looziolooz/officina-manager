"use client";
import { useState } from "react";
import { Search, Car, Wrench, User, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SearchResult {
  id: string;
  plate: string;
  brand: string;
  model: string;
  owner: { firstName: string; lastName: string };
}

export default function NewJobPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchVehicle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length < 2) return setResults([]);
    setLoading(true);
    const res = await fetch(`/api/vehicles/search?q=${val}`);
    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-white">
      <h1 className="text-3xl font-bold flex items-center gap-3"><Wrench className="text-blue-500" /> Nuova Scheda</h1>
      <div className="relative">
        <Search className="absolute left-4 top-4 text-gray-500" />
        <input type="text" value={query} onChange={searchVehicle} placeholder="Targa o Cognome..." className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12" />
      </div>
      <div className="space-y-4">
        {results.map((vehicle) => (
          <div key={vehicle.id} className="bg-white/5 border border-white/10 p-5 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-5">
              <Car size={24} className="text-blue-500" />
              <div>
                <p className="text-2xl font-black uppercase">{vehicle.plate}</p>
                <p className="text-gray-400">{vehicle.brand} {vehicle.model}</p>
              </div>
              <div className="h-10 w-px bg-white/10 mx-4" />
              <p className="text-sm font-bold">{vehicle.owner.firstName} {vehicle.owner.lastName}</p>
            </div>
            <Link href={`/admin/workshop/create?vehicleId=${vehicle.id}`} className="bg-blue-600 px-6 py-2 rounded-lg font-bold">Apri <ArrowRight size={18} className="inline ml-2"/></Link>
          </div>
        ))}
      </div>
    </div>
  );
}