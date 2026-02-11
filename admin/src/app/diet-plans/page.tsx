"use client";

import { useEffect, useState } from "react";
import { dietPlans, users, DietPlan, Client } from "@/lib/api";
import { Plus, Edit, Trash2, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function DietPlansPage() {
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    client_id: "",
    title: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  const loadData = async () => {
    try {
      const [p, c] = await Promise.all([dietPlans.list(), users.clients()]);
      setPlans(p);
      setClients(c);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu diyet planini silmek istediginize emin misiniz?")) return;
    try {
      await dietPlans.delete(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.full_name || "Bilinmeyen";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Diyet Planlari</h1>
        <Button onClick={() => setShowCreate(true)} icon={<Plus size={20} />}>
          Yeni Plan
        </Button>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Yeni Diyet Plani" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select
            label="Danisan"
            value={form.client_id}
            onChange={(e) => setForm({ ...form, client_id: e.target.value })}
            required
          >
            <option value="">Danisan secin</option>
            {clients.filter((c) => c.status === "active").map((c) => (
              <option key={c.id} value={c.id}>{c.full_name}</option>
            ))}
          </Select>
          <Input
            label="Plan Adi"
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Textarea
            label="Aciklama"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Baslangic"
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              required
            />
            <Input
              label="Bitis"
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">
              Olustur
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="flex-1">
              Iptal
            </Button>
          </div>
        </form>
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} hover>
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{plan.title}</h3>
                  <p className="text-sm text-gray-500">{getClientName(plan.client_id)}</p>
                </div>
                <Badge variant={plan.is_active ? "success" : "neutral"}>
                  {plan.is_active ? "Aktif" : "Pasif"}
                </Badge>
              </div>
              {plan.description && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{plan.description}</p>}
              <div className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                <span className="bg-gray-100 px-2 py-1 rounded">{plan.start_date}</span>
                <span>-</span>
                <span className="bg-gray-100 px-2 py-1 rounded">{plan.end_date}</span>
              </div>
              <div className="text-sm text-gray-600 mb-4 flex items-center gap-1">
                <UtensilsCrossed size={16} className="text-gray-400" />
                <span>{plan.meals.length} ogun tanimli</span>
              </div>
              <div className="flex gap-2">
                <Link href={`/diet-plans/${plan.id}`} className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full" icon={<Edit size={14} />}>
                    Duzenle
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(plan.id)}
                  icon={<Trash2 size={14} />}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Sil
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {plans.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-16">
            <UtensilsCrossed size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Henuz diyet plani olusturulmamis</p>
            <p className="text-sm mt-1">Yeni bir plan olusturmak icin yukardaki butona tiklayin</p>
          </div>
        )}
      </div>
    </div>
  );
}
