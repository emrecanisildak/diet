"use client";

import { useEffect, useState } from "react";
import { appointments, users, Appointment, Client, AppointmentCreate } from "@/lib/api";
import { Plus, ChevronLeft, ChevronRight, Calendar, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CalendarPage() {
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<AppointmentCreate>({ client_id: "", title: "", date_time: "", duration_minutes: 30, notes: "" });

  const loadData = async () => {
    try {
      const [a, c] = await Promise.all([appointments.list(), users.clients()]);
      setAppts(a);
      setClients(c);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await appointments.create(form);
      setShowCreate(false);
      setForm({ client_id: "", title: "", date_time: "", duration_minutes: 30, notes: "" });
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu randevuyu silmek istediginize emin misiniz?")) return;
    try { await appointments.delete(id); loadData(); }
    catch (err) { console.error(err); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try { await appointments.update(id, { status }); loadData(); }
    catch (err) { console.error(err); }
  };

  const getClientName = (clientId: string) => clients.find((c) => c.id === clientId)?.full_name || "Bilinmeyen";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - startOffset + 1;
    if (day < 1 || day > daysInMonth) return null;
    return day;
  });

  const getApptsForDay = (day: number) =>
    appts.filter((a) => {
      const d = new Date(a.date_time);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });

  const monthNames = ["Ocak", "Subat", "Mart", "Nisan", "Mayis", "Haziran", "Temmuz", "Agustos", "Eylul", "Ekim", "Kasim", "Aralik"];

  const upcomingAppts = appts
    .filter((a) => a.status === "scheduled" && new Date(a.date_time) > new Date())
    .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime());

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Takvim"
        subtitle="Randevu planlamanizi yonetin"
        action={
          <Button onClick={() => setShowCreate(true)} icon={<Plus size={16} />}>
            Yeni Randevu
          </Button>
        }
      />

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Yeni Randevu" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select label="Danisan" value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} required>
            <option value="">Danisan secin</option>
            {clients.filter((c) => c.status === "active").map((c) => (
              <option key={c.id} value={c.id}>{c.full_name}</option>
            ))}
          </Select>
          <Input label="Baslik" type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Tarih ve Saat" type="datetime-local" value={form.date_time} onChange={(e) => setForm({ ...form, date_time: e.target.value })} required />
          <Input label="Sure (dakika)" type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">Randevu Olustur</Button>
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="flex-1">Iptal</Button>
          </div>
        </form>
      </Modal>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-violet-100/60 overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-2 hover:bg-violet-50 rounded-xl text-gray-500 hover:text-violet-600 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-base font-semibold text-gray-900">{monthNames[month]} {year}</h2>
            <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-2 hover:bg-violet-50 rounded-xl text-gray-500 hover:text-violet-600 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                const dayAppts = day ? getApptsForDay(day) : [];
                const isToday = day && new Date().getFullYear() === year && new Date().getMonth() === month && new Date().getDate() === day;
                return (
                  <div
                    key={i}
                    className={`min-h-[80px] rounded-xl p-1.5 transition-colors ${day ? "hover:bg-violet-50/50" : ""} ${!day ? "opacity-0" : ""}`}
                  >
                    {day && (
                      <>
                        <div className={`w-7 h-7 flex items-center justify-center text-sm font-medium rounded-full mb-1 mx-auto ${isToday ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/30" : "text-gray-600"}`}>
                          {day}
                        </div>
                        <div className="space-y-0.5">
                          {dayAppts.slice(0, 2).map((appt) => (
                            <div
                              key={appt.id}
                              className={`text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium ${
                                appt.status === "cancelled" ? "bg-rose-100 text-rose-600" :
                                appt.status === "completed" ? "bg-gray-100 text-gray-500" :
                                "bg-violet-100 text-violet-700"
                              }`}
                              title={`${appt.title} - ${getClientName(appt.client_id)}`}
                            >
                              {new Date(appt.date_time).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} {appt.title}
                            </div>
                          ))}
                          {dayAppts.length > 2 && (
                            <div className="text-[10px] text-violet-500 font-medium px-1">+{dayAppts.length - 2}</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming appointments sidebar */}
        <div className="bg-white rounded-2xl shadow-sm border border-violet-100/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Yaklasan Randevular</h2>
            <p className="text-xs text-gray-400 mt-0.5">{upcomingAppts.length} randevu planli</p>
          </div>
          <div className="p-4 space-y-2.5 max-h-[500px] overflow-y-auto">
            {upcomingAppts.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={32} className="mx-auto text-gray-200 mb-3" />
                <p className="text-sm text-gray-400">Yaklasan randevu yok</p>
              </div>
            ) : (
              upcomingAppts.map((appt) => (
                <div key={appt.id} className="p-3 bg-violet-50/60 rounded-xl border border-violet-100/50 hover:bg-violet-50 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-medium text-sm text-gray-900 leading-tight">{appt.title}</p>
                    <Badge variant="purple">{appt.duration_minutes}dk</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{getClientName(appt.client_id)} · {new Date(appt.date_time).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleStatusChange(appt.id, "completed")}
                      className="flex items-center gap-1 text-[11px] px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 font-medium transition-colors"
                    >
                      <CheckCircle2 size={11} /> Tamamla
                    </button>
                    <button
                      onClick={() => handleStatusChange(appt.id, "cancelled")}
                      className="flex items-center gap-1 text-[11px] px-2 py-1 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 font-medium transition-colors"
                    >
                      <XCircle size={11} /> Iptal
                    </button>
                    <button
                      onClick={() => handleDelete(appt.id)}
                      className="flex items-center gap-1 text-[11px] px-2 py-1 text-gray-400 rounded-lg hover:bg-gray-100 hover:text-gray-600 font-medium transition-colors ml-auto"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* All appointments list */}
      {appts.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-violet-100/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Tum Randevular</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {appts
              .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
              .map((appt) => (
                <div key={appt.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${appt.status === "completed" ? "bg-emerald-400" : appt.status === "cancelled" ? "bg-rose-400" : "bg-violet-400"}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{appt.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{getClientName(appt.client_id)} · {new Date(appt.date_time).toLocaleString("tr-TR")} · {appt.duration_minutes} dk</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={appt.status === "completed" ? "success" : appt.status === "cancelled" ? "danger" : "purple"}>
                      {appt.status === "completed" ? "Tamamlandi" : appt.status === "cancelled" ? "Iptal" : "Planli"}
                    </Badge>
                    {appt.status === "scheduled" && (
                      <>
                        <button onClick={() => handleStatusChange(appt.id, "completed")} className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 font-medium transition-colors">Tamamla</button>
                        <button onClick={() => handleStatusChange(appt.id, "cancelled")} className="text-xs px-2 py-1 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 font-medium transition-colors">Iptal</button>
                      </>
                    )}
                    <button onClick={() => handleDelete(appt.id)} className="text-gray-300 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
