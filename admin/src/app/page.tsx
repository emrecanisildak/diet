"use client";

import { useEffect, useState } from "react";
import { users, dietPlans, appointments, Client, DietPlan, Appointment } from "@/lib/api";
import { Users, UtensilsCrossed, Calendar, TrendingDown } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
      </div>
    );
  }

  const activeClients = clients.filter((c) => c.status === "active");
  const activePlans = plans.filter((p) => p.is_active);
  const upcomingAppts = appts.filter(
    (a) => a.status === "scheduled" && new Date(a.date_time) > new Date()
  );

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Aktif Danisanlar"
          value={activeClients.length}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Aktif Diyet Planlari"
          value={activePlans.length}
          icon={UtensilsCrossed}
          color="green"
        />
        <StatCard
          label="Yaklasan Randevular"
          value={upcomingAppts.length}
          icon={Calendar}
          color="purple"
        />
        <StatCard
          label="Toplam Danisan"
          value={clients.length}
          icon={TrendingDown}
          color="orange"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Yaklasan Randevular</h2>
            {upcomingAppts.length === 0 ? (
              <p className="text-gray-500 text-sm">Yaklasan randevu yok</p>
            ) : (
              <div className="space-y-3">
                {upcomingAppts.slice(0, 5).map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{appt.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(appt.date_time).toLocaleString("tr-TR")}</p>
                    </div>
                    <Badge variant="success">{appt.duration_minutes} dk</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Recent Clients */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Son Danisanlar</h2>
            {clients.length === 0 ? (
              <p className="text-gray-500 text-sm">Henuz danisan yok</p>
            ) : (
              <div className="space-y-3">
                {clients.slice(0, 5).map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{client.full_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{client.email}</p>
                    </div>
                    <Badge variant={client.status === "active" ? "success" : "neutral"}>
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
