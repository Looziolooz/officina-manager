"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Wrench, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Car,
  Package,
  Euro // <--- Nuova icona per la Contabilità
} from "lucide-react";

const MENU_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Officina", href: "/admin/workshop", icon: Wrench },
  { label: "Magazzino", href: "/admin/warehouse", icon: Package },
  // 👇 NUOVA VOCE AGGIUNTA
  { label: "Contabilità", href: "/admin/accounting", icon: Euro },
  { label: "Clienti", href: "/admin/customers", icon: Users },
  { label: "Impostazioni", href: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={`
        bg-slate-950 border-r border-white/10 h-screen sticky top-0 flex flex-col transition-all duration-300 ease-in-out z-50
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      {/* --- LOGO --- */}
      <div className="h-20 flex items-center justify-center border-b border-white/5 relative">
        <div className="flex items-center gap-3 text-white font-bold tracking-tighter overflow-hidden whitespace-nowrap">
          {/* FIX: bg-linear-to-br sintassi Tailwind v4 */}
          <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
            <Car className="text-white" size={20} />
          </div>
          <span className={`transition-opacity duration-300 ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"}`}>
            GT Service
          </span>
        </div>

        {/* Bottone Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-800 border border-white/20 rounded-full text-white flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 transition-colors shadow-lg z-50 cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* --- MENU LINKS --- */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : ""}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative
                ${isActive 
                  ? "bg-primary text-white shadow-lg shadow-orange-900/20" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
                }
                ${isCollapsed ? "justify-center" : ""}
              `}
            >
              <Icon size={20} className={`shrink-0 ${isActive ? "text-white" : "group-hover:text-orange-400"} transition-colors`} />
              
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
                {item.label}
              </span>

              {/* Tooltip on Hover */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* --- FOOTER --- */}
      <div className="p-4 border-t border-white/5">
        <button 
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all
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