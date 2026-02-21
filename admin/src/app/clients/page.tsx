"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { users, auth, Client } from "@/lib/api";
import { UserPlus, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
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

  useEffect(() => { loadClients(); }, []);

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
    } catch (err) { console.error(err); }
  };

  if (loading) return <LoadingSpinner />;

  const filtered = clients.filter(
    (c) => c.full_name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Danisanlar"
        subtitle={`${clients.length} danisan kayitli`}
        action={
          <Button onClick={() => setShowAdd(true)} icon={<UserPlus size={16} />}>
            Yeni Danisan
          </Button>
        }
      />

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Yeni Danisan Ekle" size="md">
        {error && (
          <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm mb-4 border border-rose-100">
            {error}
          </div>
        )}
        <form onSubmit={handleAddClient} className="space-y-4">
          <Input label="Ad Soyad" type="text" value={newClient.full_name} onChange={(e) => setNewClient({ ...newClient, full_name: e.target.value })} required />
          <Input label="E-posta" type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} required />
          <Input label="Sifre" type="password" value={newClient.password} onChange={(e) => setNewClient({ ...newClient, password: e.target.value })} required />
          <Input label="Telefon" type="tel" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">Danisan Ekle</Button>
            <Button type="button" variant="outline" onClick={() => setShowAdd(false)} className="flex-1">Iptal</Button>
          </div>
        </form>
      </Modal>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Ad veya e-posta ile ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-violet-100 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/15 transition-all shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-violet-100/60 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="Danisan bulunamadi" description="Arama kriterlerinizi degistirin veya yeni danisan ekleyin." />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gradient-to-r from-violet-50/80 to-indigo-50/50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Danisan</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">E-posta</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Telefon</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Islemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-violet-50/30 transition-colors cursor-pointer group"
                  onClick={() => router.push(`/clients/${client.id}`)}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {client.full_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{client.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{client.email}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">{client.phone || "—"}</td>
                  <td className="px-5 py-4">
                    <Badge variant={client.status === "active" ? "success" : "neutral"} dot>
                      {client.status === "active" ? "Aktif" : "Pasif"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/clients/${client.id}`); }}>
                        Profil
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleRemove(client.id); }} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                        Kaldir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
