"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Users, 
  Wrench, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Car,
  Package,
  Euro,
  Calendar,
  MessageCircle
} from "lucide-react";

const MENU_ITEMS = [
  // FIX: Aggiornato href per puntare alla nuova dashboard analitica
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Calendario", href: "/admin/calendar", icon: Calendar },
  { label: "Officina", href: "/admin/workshop", icon: Wrench },
  { label: "Magazzino", href: "/admin/warehouse", icon: Package },
  { label: "Contabilità", href: "/admin/accounting", icon: Euro },
  { label: "Clienti", href: "/admin/customers", icon: Users },
  { label: "WhatsApp", href: "/admin/whatsapp", icon: MessageCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`
        bg-surface border-r border-border h-screen sticky top-0 flex flex-col transition-all duration-300 ease-in-out z-50
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      {/* --- LOGO --- */}
      <div className="h-20 flex items-center justify-center border-b border-border relative">
        <div className="flex items-center gap-3 text-foreground font-bold tracking-tighter overflow-hidden whitespace-nowrap">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <Car className="text-white" size={20} />
          </div>
          <span className={`transition-opacity duration-300 ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"}`}>
            GT <span className="text-primary">Service</span>
          </span>
        </div>

        {/* Bottone Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-surface border border-border rounded-full text-muted-foreground flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-colors shadow-sm z-50 cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* --- MENU LINKS --- */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
        {MENU_ITEMS.map((item) => {
          // Logica attiva migliorata per gestire le sottocartelle
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : ""}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative
                ${isActive 
                  ? "bg-primary text-white shadow-lg shadow-red-900/20" 
                  : "text-muted-foreground hover:bg-background hover:text-foreground"
                }
                ${isCollapsed ? "justify-center" : ""}
              `}
            >
              <Icon size={20} className={`shrink-0 ${isActive ? "text-white" : "group-hover:text-primary"} transition-colors`} />
              
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
                {item.label}
              </span>

              {/* Tooltip on Hover */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 bg-background text-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border pointer-events-none z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* --- FOOTER --- */}
      <div className="p-4 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all cursor-pointer
            ${isCollapsed ? "justify-center" : ""}
          `}
          title={isCollapsed ? "Logout" : ""}
        >
          <LogOut size={20} />
          <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
            Esci
          </span>
        </button>
      </div>
    </aside>
  );
}