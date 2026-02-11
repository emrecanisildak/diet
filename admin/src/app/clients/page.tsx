"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { users, auth, Client } from "@/lib/api";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newClient, setNewClient] = useState({ email: "", password: "", full_name: "", phone: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const loadClients = async () => {
    try {
      const data = await users.clients();
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const created = await auth.register({
        email: newClient.email,
        password: newClient.password,
        full_name: newClient.full_name,
        role: "client",
        phone: newClient.phone || undefined,
      }) as { id: string };
      await users.addClient(created.id);
      setShowAdd(false);
      setNewClient({ email: "", password: "", full_name: "", phone: "" });
      loadClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata olustu");
    }
  };

  const handleRemove = async (clientId: string) => {
    if (!confirm("Bu danisani kaldirmak istediginize emin misiniz?")) return;
    try {
      await users.removeClient(clientId);
      loadClients();
    } catch (err) {
      console.error(err);
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Danisanlar</h1>
        <Button onClick={() => setShowAdd(true)} icon={<UserPlus size={20} />}>
          Yeni Danisan
        </Button>
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Yeni Danisan Ekle" size="md">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-100">
            {error}
          </div>
        )}
        <form onSubmit={handleAddClient} className="space-y-4">
          <Input
            label="Ad Soyad"
            type="text"
            value={newClient.full_name}
            onChange={(e) => setNewClient({ ...newClient, full_name: e.target.value })}
            required
          />
          <Input
            label="E-posta"
            type="email"
            value={newClient.email}
            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
            required
          />
          <Input
            label="Sifre"
            type="password"
            value={newClient.password}
            onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
            required
          />
          <Input
            label="Telefon"
            type="tel"
            value={newClient.phone}
            onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">
              Danisan Ekle
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowAdd(false)} className="flex-1">
              Iptal
            </Button>
          </div>
        </form>
      </Modal>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left p-4 text-sm font-semibold text-gray-700">Ad Soyad</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-700">E-posta</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-700">Telefon</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-700">Durum</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-700">Islemler</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr
                key={client.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => router.push(`/clients/${client.id}`)}
              >
                <td className="p-4 text-sm font-medium text-gray-900">{client.full_name}</td>
                <td className="p-4 text-sm text-gray-600">{client.email}</td>
                <td className="p-4 text-sm text-gray-600">{client.phone || "-"}</td>
                <td className="p-4">
                  <Badge variant={client.status === "active" ? "success" : "neutral"}>
                    {client.status === "active" ? "Aktif" : "Pasif"}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); router.push(`/clients/${client.id}`); }}
                    >
                      Profil
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleRemove(client.id); }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Kaldir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Henuz danisan eklenmemis
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
