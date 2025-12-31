"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  Users, 
  Wrench, 
  Wallet, 
  Package, 
  LayoutDashboard,
  LogOut, 
  Settings as SettingsIcon 
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility per gestire le classi CSS (se non hai già lib/utils.ts)
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const dashboardLinks = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Clienti", href: "/admin/customers", icon: Users },
  { name: "Officina", href: "/admin/workshop", icon: Wrench },
  { name: "Magazzino", href: "/admin/inventory", icon: Package },
  { name: "Contabilità", href: "/admin/accounting", icon: Wallet },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/10 bg-[#0a0a0a] p-4 flex flex-col">
      <div className="mb-8 px-2">
        <span className="text-xl font-bold tracking-tighter text-white">
          GT <span className="text-[#3b82f6]">SERVICE</span>
        </span>
        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Gestione Officina</p>
      </div>

      <nav className="flex-1 space-y-1">
        {dashboardLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                isActive 
                  ? "bg-[#3b82f6]/10 text-[#3b82f6]" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={20} className={isActive ? "text-[#3b82f6]" : "group-hover:text-white"} />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 pt-4 mt-auto space-y-1">
        <Link
          href="/admin/settings"
          className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
        >
          <SettingsIcon size={20} />
          <span>Impostazioni</span>
        </Link>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Esci</span>
        </button>
      </div>
    </aside>
  );
}