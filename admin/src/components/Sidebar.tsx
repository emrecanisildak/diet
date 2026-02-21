"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  MessageSquare,
  Calendar,
  TrendingDown,
  LogOut,
  Bell,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Danisanlar", icon: Users },
  { href: "/diet-plans", label: "Diyet Planlari", icon: UtensilsCrossed },
  { href: "/chat", label: "Mesajlar", icon: MessageSquare },
  { href: "/calendar", label: "Takvim", icon: Calendar },
  { href: "/weight-tracking", label: "Kilo Takibi", icon: TrendingDown },
  { href: "/notifications", label: "Bildirimler", icon: Bell },
];

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="w-64 min-h-screen flex flex-col bg-gradient-to-b from-violet-950 via-purple-900 to-indigo-900 shadow-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-violet-400 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/40">
            <UtensilsCrossed size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Nutrivaldi</h1>
            <p className="text-xs text-violet-300 font-medium">Yonetim Paneli</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-[11px] font-semibold text-violet-400 uppercase tracking-wider px-3 pt-2 pb-3">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-white/15 text-white shadow-lg shadow-black/20 backdrop-blur-sm"
                  : "text-violet-200 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-violet-300 to-indigo-300 rounded-r-full" />
              )}
              <Icon size={19} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-white/10">
        {user && (
          <div className="px-3 py-2.5 mb-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <p className="text-sm font-semibold text-white truncate">{user.full_name}</p>
            <p className="text-xs text-violet-300 truncate mt-0.5">{user.email}</p>
          </div>
        )}
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 w-full transition-all duration-200 group"
        >
          <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
          Cikis Yap
        </button>
      </div>
    </aside>
  );
}
