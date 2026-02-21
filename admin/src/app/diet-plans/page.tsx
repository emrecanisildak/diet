"use client";

import { useEffect, useState } from "react";
import { dietPlans, users, DietPlan, Client } from "@/lib/api";
import { Plus, Edit2, Trash2, UtensilsCrossed, CalendarDays } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

export default function DietPlansPage() {
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ client_id: "", title: "", description: "", start_date: "", end_date: "" });

  const loadData = async () => {
    try {
      const [p, c] = await Promise.all([dietPlans.list(), users.clients()]);
      setPlans(p);
      setClients(c);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dietPlans.create({
        client_id: form.client_id,
        title: form.title,
        description: form.description || undefined,
        start_date: form.start_date,
        end_date: form.end_date,
      });
      setShowCreate(false);
      setForm({ client_id: "", title: "", description: "", start_date: "", end_date: "" });
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu diyet planini silmek istediginize emin misiniz?")) return;
    try {
      await dietPlans.delete(id);
      loadData();
    } catch (err) { console.error(err); }
  };

  const getClientName = (clientId: string) => clients.find((c) => c.id === clientId)?.full_name || "Bilinmeyen";

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Diyet Planlari"
        subtitle={`${plans.length} plan olusturuldu`}
        action={
          <Button onClick={() => setShowCreate(true)} icon={<Plus size={16} />}>
            Yeni Plan
          </Button>
        }
      />

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Yeni Diyet Plani" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select label="Danisan" value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} required>
            <option value="">Danisan secin</option>
            {clients.filter((c) => c.status === "active").map((c) => (
              <option key={c.id} value={c.id}>{c.full_name}</option>
            ))}
          </Select>
          <Input label="Plan Adi" type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Aciklama" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Baslangic" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
            <Input label="Bitis" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">Olustur</Button>
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="flex-1">Iptal</Button>
          </div>
        </form>
      </Modal>

      {plans.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="Henuz diyet plani olusturulmamis"
          description="Ilk planini olusturmak icin yukardaki butona tikla."
          action={<Button onClick={() => setShowCreate(true)} icon={<Plus size={16} />}>Yeni Plan</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-2xl border border-violet-100/60 shadow-sm hover:shadow-md hover:shadow-violet-100 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group">
              {/* Card top bar */}
              <div className={`h-1.5 w-full ${plan.is_active ? "bg-gradient-to-r from-violet-500 to-indigo-500" : "bg-gray-200"}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <h3 className="font-semibold text-gray-900 truncate">{plan.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{getClientName(plan.client_id)}</p>
                  </div>
                  <Badge variant={plan.is_active ? "success" : "neutral"} dot>
                    {plan.is_active ? "Aktif" : "Pasif"}
                  </Badge>
                </div>

                {plan.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">{plan.description}</p>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 bg-gray-50 rounded-lg px-3 py-2">
                  <CalendarDays size={13} className="text-violet-400 shrink-0" />
                  <span>{plan.start_date}</span>
                  <span className="text-gray-300">→</span>
                  <span>{plan.end_date}</span>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
                  <UtensilsCrossed size={14} className="text-violet-400" />
                  <span>{plan.meals.length} ogun tanimli</span>
                </div>

                <div className="flex gap-2">
                  <Link href={`/diet-plans/${plan.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full" icon={<Edit2 size={13} />}>
                      Duzenle
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(plan.id)}
                    icon={<Trash2 size={13} />}
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                  >
                    Sil
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
