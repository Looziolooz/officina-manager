import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* La Sidebar gestisce la sua larghezza internamente */}
      <Sidebar />
      
      {/* Contenuto principale che si espande */}
      <main className="flex-1 overflow-x-hidden transition-all duration-300">
        {children}
      </main>
    </div>
  );
}