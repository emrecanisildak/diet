"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  users,
  dietPlans as dietPlansApi,
  weightLogs,
  Client,
  DietPlan,
  DietPlanCreate,
  WeightLog,
  Appointment,
} from "@/lib/api";
import {
  ArrowLeft,
  Plus,
  UtensilsCrossed,
  Calendar,
  Scale,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [planForm, setPlanForm] = useState<Omit<DietPlanCreate, "client_id">>({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
  });
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [clientData, plansData, logData, apptsData] = await Promise.all([
        users.getClient(clientId),
        users.getClientDietPlans(clientId),
        weightLogs.getClientLogs(clientId),
        users.getClientAppointments(clientId),
      ]);
      setClient(clientData);
      setPlans(plansData);
      setLogs(logData);
      setAppts(apptsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [clientId]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await dietPlansApi.create({
        ...planForm,
        client_id: clientId,
      });
      setShowCreatePlan(false);
      setPlanForm({ title: "", description: "", start_date: "", end_date: "" });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata olustu");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Danisan bulunamadi</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/clients")}>
          Danisanlara Don
        </Button>
      </div>
    );
  }

  const activePlans = plans.filter((p) => p.is_active);
  const latestWeight = logs.length > 0 ? logs[0] : null;
  const upcomingAppts = appts.filter((a) => a.status === "scheduled");

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => router.push("/clients")}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={20} />
        Danisanlar
      </button>

      {/* Client Info Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {client.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{client.full_name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Mail size={14} />
                  {client.email}
                </span>
                {client.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={14} />
                    {client.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Badge variant={client.status === "active" ? "success" : "neutral"}>
            {client.status === "active" ? "Aktif" : "Pasif"}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UtensilsCrossed size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activePlans.length}</p>
              <p className="text-xs text-gray-500">Aktif Plan</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UtensilsCrossed size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
              <p className="text-xs text-gray-500">Toplam Plan</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Scale size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {latestWeight ? `${latestWeight.weight} kg` : "-"}
              </p>
              <p className="text-xs text-gray-500">Son Kilo</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{upcomingAppts.length}</p>
              <p className="text-xs text-gray-500">Yaklasan Randevu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Diet Plans Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Diyet Planlari</h2>
          <Button onClick={() => setShowCreatePlan(true)} icon={<Plus size={18} />} size="sm">
            Yeni Plan
          </Button>
        </div>

        {plans.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <UtensilsCrossed size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">Henuz diyet plani olusturulmamis</p>
            <Button
              onClick={() => setShowCreatePlan(true)}
              variant="outline"
              className="mt-3"
              size="sm"
            >
              Ilk Plani Olustur
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Link key={plan.id} href={`/diet-plans/${plan.id}`}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{plan.title}</h3>
                    <Badge variant={plan.is_active ? "success" : "neutral"}>
                      {plan.is_active ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>
                  {plan.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{plan.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{plan.start_date}</span>
                    <span>-</span>
                    <span>{plan.end_date}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {plan.meals.length} ogun tanimli
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Weight Logs */}
      {logs.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Kilo Gecmisi</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Tarih</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Kilo</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Degisim</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Not</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 10).map((log, index) => {
                  const prev = logs[index + 1];
                  const change = prev ? log.weight - prev.weight : 0;
                  return (
                    <tr key={log.id} className="border-b border-gray-50">
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(log.logged_at).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="p-3 text-sm font-medium text-gray-900">{log.weight} kg</td>
                      <td className="p-3 text-sm">
                        {change !== 0 && (
                          <span className={change > 0 ? "text-red-500" : "text-green-500"}>
                            {change > 0 ? "+" : ""}
                            {change.toFixed(1)} kg
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-gray-500">{log.note || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Appointments */}
      {appts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Randevular</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Baslik</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Tarih</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Sure</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Durum</th>
                </tr>
              </thead>
              <tbody>
                {appts.slice(0, 10).map((appt) => (
                  <tr key={appt.id} className="border-b border-gray-50">
                    <td className="p-3 text-sm font-medium text-gray-900">{appt.title}</td>
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(appt.date_time).toLocaleString("tr-TR")}
                    </td>
                    <td className="p-3 text-sm text-gray-600">{appt.duration_minutes} dk</td>
                    <td className="p-3">
                      <Badge
                        variant={
                          appt.status === "scheduled"
                            ? "info"
                            : appt.status === "completed"
                            ? "success"
                            : "danger"
                        }
                      >
                        {appt.status === "scheduled"
                          ? "Planlanmis"
                          : appt.status === "completed"
                          ? "Tamamlandi"
                          : "Iptal"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Plan Modal */}
      <Modal
        isOpen={showCreatePlan}
        onClose={() => setShowCreatePlan(false)}
        title="Yeni Diyet Plani"
        size="md"
      >
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-100">
            {error}
          </div>
        )}
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <Input
            label="Plan Adi"
            value={planForm.title}
            onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
            required
          />
          <Textarea
            label="Aciklama"
            value={planForm.description || ""}
            onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Baslangic Tarihi"
              type="date"
              value={planForm.start_date}
              onChange={(e) => setPlanForm({ ...planForm, start_date: e.target.value })}
              required
            />
            <Input
              label="Bitis Tarihi"
              type="date"
              value={planForm.end_date}
              onChange={(e) => setPlanForm({ ...planForm, end_date: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">
              Plan Olustur
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreatePlan(false)}
              className="flex-1"
            >
              Iptal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
