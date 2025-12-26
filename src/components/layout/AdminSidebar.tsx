"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Wrench, 
  Package, 
  BarChart3, 
  Users, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions/auth"; // [!code ++] Importiamo l'azione sicura

const menuItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }, // Nota: Ho aggiunto /admin/ per sicurezza nei link
  { name: "Officina", href: "/admin/officina", icon: Wrench },
  { name: "Magazzino", href: "/admin/magazzino", icon: Package },
  { name: "Clienti", href: "/admin/clienti", icon: Users },
  { name: "Contabilità", href: "/admin/contabilita", icon: BarChart3 },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-slate-900 border-r border-slate-800 min-h-screen">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-wider">
          Officina<span className="text-orange-500">Pro</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Admin Panel v1.0</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-orange-600/10 text-orange-500 border border-orange-600/20" 
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        {/* [!code ++] Form collegato alla Server Action */}
        <form action={logout}>
          <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors">
            <LogOut className="w-5 h-5" />
            Esci
          </button>
        </form>
      </div>
    </div>
  );
}