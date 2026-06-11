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
  MessageCircle,
  Menu,
  X,
} from "lucide-react";

const MENU_ITEMS = [
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
  const [isCollapsed, setIsCollapsed] = useState(false); // collapse desktop
  const [mobileOpen, setMobileOpen] = useState(false); // drawer mobile

  return (
    <>
      {/* Hamburger — solo mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 w-10 h-10 bg-surface border border-border rounded-lg flex items-center justify-center text-foreground shadow-sm"
        aria-label="Apri menu"
      >
        <Menu size={20} />
      </button>

      {/* Backdrop — solo mobile, quando il drawer è aperto */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`
          bg-surface border-r border-border flex flex-col z-50 transition-all duration-300 ease-in-out
          fixed inset-y-0 left-0 md:sticky md:top-0 md:h-screen
          w-64 ${isCollapsed ? "md:w-20" : "md:w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        {/* --- LOGO --- */}
        <div className="h-20 flex items-center justify-center border-b border-border relative">
          <div className="flex items-center gap-3 text-foreground font-bold tracking-tighter overflow-hidden whitespace-nowrap">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <Car className="text-white" size={20} />
            </div>
            <span className={`transition-opacity duration-300 ${isCollapsed ? "md:opacity-0 md:w-0 md:hidden" : "opacity-100"}`}>
              GT <span className="text-primary">Service</span>
            </span>
          </div>

          {/* Chiudi — solo mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg text-muted-foreground hover:bg-background flex items-center justify-center"
            aria-label="Chiudi menu"
          >
            <X size={18} />
          </button>

          {/* Collapse — solo desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-surface border border-border rounded-full text-muted-foreground items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-colors shadow-sm z-50 cursor-pointer"
            aria-label="Comprimi menu"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* --- MENU LINKS --- */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={isCollapsed ? item.label : ""}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative
                  ${isActive
                    ? "bg-primary text-white shadow-lg shadow-red-900/20"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                  }
                  ${isCollapsed ? "md:justify-center" : ""}
                `}
              >
                <Icon size={20} className={`shrink-0 ${isActive ? "text-white" : "group-hover:text-primary"} transition-colors`} />
                <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* --- FOOTER --- */}
        <div className="p-4 border-t border-border">
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all cursor-pointer ${isCollapsed ? "md:justify-center" : ""}`}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut size={20} />
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"}`}>
              Esci
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
