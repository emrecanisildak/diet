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
  ChevronLeft,
  ChevronRight,
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

interface SidebarProps {
  onLogout: () => void;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ onLogout, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside
      className={`
        min-h-screen flex flex-col bg-gradient-to-b from-violet-950 via-purple-900 to-indigo-900 shadow-2xl
        transition-all duration-300 ease-in-out shrink-0
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      {/* Logo + Toggle */}
      <div className={`flex items-center border-b border-white/10 h-16 ${collapsed ? "justify-center px-0" : "px-4 gap-3"}`}>
        {!collapsed && (
          <>
            <div className="w-9 h-9 bg-gradient-to-br from-violet-400 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/40 shrink-0">
              <UtensilsCrossed size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-white tracking-tight">Nutrivaldi</h1>
              <p className="text-[10px] text-violet-300 font-medium">Yonetim Paneli</p>
            </div>
          </>
        )}
        {collapsed && (
          <div className="w-9 h-9 bg-gradient-to-br from-violet-400 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/40">
            <UtensilsCrossed size={18} className="text-white" strokeWidth={2.5} />
          </div>
        )}
        <button
          onClick={onToggle}
          className={`p-1.5 rounded-lg text-violet-300 hover:text-white hover:bg-white/10 transition-colors ${collapsed ? "absolute left-16 -translate-x-1/2 top-4 bg-violet-800 border border-white/10 shadow-lg z-10" : ""}`}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 mt-2">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider px-3 pt-1 pb-2">
            Menu
          </p>
        )}
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`
                group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200
                ${collapsed ? "justify-center px-0 py-2.5 mx-1" : "px-3 py-2.5"}
                ${isActive
                  ? "bg-white/15 text-white shadow-lg shadow-black/20"
                  : "text-violet-200 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              {isActive && !collapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-violet-300 to-indigo-300 rounded-r-full" />
              )}
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className={`p-2 border-t border-white/10 ${collapsed ? "" : "p-4"}`}>
        {!collapsed && user && (
          <div className="px-3 py-2.5 mb-2 bg-white/10 rounded-xl">
            <p className="text-sm font-semibold text-white truncate">{user.full_name}</p>
            <p className="text-xs text-violet-300 truncate mt-0.5">{user.email}</p>
          </div>
        )}
        <button
          onClick={onLogout}
          title={collapsed ? "Cikis Yap" : undefined}
          className={`
            flex items-center gap-3 rounded-xl text-sm font-medium text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 w-full transition-all duration-200 group
            ${collapsed ? "justify-center px-0 py-2.5 mx-1 w-auto" : "px-3 py-2.5"}
          `}
        >
          <LogOut size={17} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
          {!collapsed && <span>Cikis Yap</span>}
        </button>
      </div>
    </aside>
  );
}
