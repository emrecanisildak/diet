"use client";

import { useEffect, useState } from "react";
import { users, dietPlans, appointments, Client, DietPlan, Appointment } from "@/lib/api";
import { Users, UtensilsCrossed, Calendar, Activity, ArrowRight, Clock } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        const [c, p, a] = await Promise.all([
          users.clients(),
          dietPlans.list(),
          appointments.list(),
        ]);
        setClients(c);
        setPlans(p);
        setAppts(a);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  const activeClients = clients.filter((c) => c.status === "active");
  const activePlans = plans.filter((p) => p.is_active);
  const upcomingAppts = appts
    .filter((a) => a.status === "scheduled" && new Date(a.date_time) > new Date())
    .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime());

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Günaydın" : hour < 18 ? "İyi öğleden sonralar" : "İyi akşamlar";

  return (
    <div className="animate-fade-in space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-7 text-white shadow-xl shadow-violet-500/25 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-24 pointer-events-none" />
        <p className="text-violet-200 text-sm font-medium mb-1">{greeting},</p>
        <h1 className="text-3xl font-bold mb-1">{user?.full_name ?? "Diyetisyen"} 👋</h1>
        <p className="text-violet-200 text-sm">Bugün {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Aktif Danisanlar" value={activeClients.length} icon={Users} color="purple" />
        <StatCard label="Aktif Diyet Planlari" value={activePlans.length} icon={UtensilsCrossed} color="green" />
        <StatCard label="Yaklasan Randevular" value={upcomingAppts.length} icon={Calendar} color="blue" />
        <StatCard label="Toplam Danisan" value={clients.length} icon={Activity} color="orange" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">Yaklasan Randevular</h2>
              <Link href="/calendar" className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
                Tümü <ArrowRight size={12} />
              </Link>
            </div>
            {upcomingAppts.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">Yaklasan randevu yok</p>
            ) : (
              <div className="space-y-2.5">
                {upcomingAppts.slice(0, 5).map((appt) => (
                  <div key={appt.id} className="flex items-center gap-3 p-3 bg-violet-50/60 rounded-xl hover:bg-violet-50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shrink-0">
                      <Clock size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{appt.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(appt.date_time).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <Badge variant="purple">{appt.duration_minutes} dk</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Recent Clients */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">Danisanlar</h2>
              <Link href="/clients" className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
                Tümü <ArrowRight size={12} />
              </Link>
            </div>
            {clients.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">Henuz danisan yok</p>
            ) : (
              <div className="space-y-2.5">
                {clients.slice(0, 5).map((client) => (
                  <div key={client.id} className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl hover:bg-gray-100/60 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shrink-0 text-white text-sm font-bold">
                      {client.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{client.full_name}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{client.email}</p>
                    </div>
                    <Badge variant={client.status === "active" ? "success" : "neutral"} dot>
                      {client.status === "active" ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
