import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar Fissa */}
      <AdminSidebar />
      
      {/* Contenuto Principale Dinamico */}
      <main className="flex-1 overflow-y-auto h-screen p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}