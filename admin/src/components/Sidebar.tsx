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
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-600/30">
            <UtensilsCrossed size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">DietApp</h1>
            <p className="text-xs text-gray-500 font-medium">Yonetim Paneli</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 pt-2 pb-3">
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
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-green-600 to-emerald-600 rounded-r-full" />
              )}
              <Icon size={19} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        {user && (
          <div className="px-3 py-2.5 mb-3 bg-white rounded-xl border border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name}</p>
            <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
          </div>
        )}
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-all duration-200 group"
        >
          <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
          Cikis Yap
        </button>
      </div>
    </aside>
  );
}
